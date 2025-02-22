package main

import (
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	// Import the organisation's helpers package as per our development guidelines
	_ "github.com/goose-ctf/helpers-9c84137e48-TomSteer1"

	// SQL driver
	_ "modernc.org/sqlite"

	// mux
	"github.com/gorilla/mux"

	// html/template
	"html/template"
)

var db *sql.DB
var router *mux.Router
var stdout *log.Logger

type Message struct {
	ID       int    `json:"id"`
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	Message  string `json:"message"`
}

func main() {
	stdout = log.New(os.Stdout, "", log.LstdFlags)

	loadDatabase()
	defer db.Close()

	// Create router
	router = mux.NewRouter()

	// Set up routes
	router.HandleFunc("/register", registerHandler).Methods("POST")
	router.HandleFunc("/login", loginHandler).Methods("POST")
	router.HandleFunc("/logout", logoutHandler).Methods("POST")
	router.HandleFunc("/", indexHandler).Methods("GET")
	router.HandleFunc("/message", messageHandler).Methods("POST")
	// Try to serve from static directory first then 404
	router.PathPrefix("/").Handler(http.FileServer(http.Dir("./static/")))
	router.NotFoundHandler = http.HandlerFunc(notFoundHandler)

	// Start server
	stdout.Fatal(http.ListenAndServe(":8080", router))
}

func loadDatabase() {
	// Create database in memory
	var err error
	stdout.Println("Loading database")
	db, err = sql.Open("sqlite", ":memory:")
	if err != nil {
		stdout.Fatal(err)
	}
	// Create tables
	// Users - id, username, hash, salt, email
	_, err = db.Exec(`CREATE TABLE users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT NOT NULL,
		hash TEXT NOT NULL,
		salt TEXT NOT NULL,
		email TEXT NOT NULL
	)`)
	if err != nil {
		stdout.Fatal(err)
	}
	// Sessions - id, user_id, token, expiry
	_, err = db.Exec(`CREATE TABLE sessions (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		token TEXT NOT NULL,
		expiry INTEGER NOT NULL
	)`)
	if err != nil {
		stdout.Fatal(err)
	}
	// Create messages table
	_, err = db.Exec(`CREATE TABLE messages (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		message TEXT NOT NULL
	)`)
	if err != nil {
		stdout.Fatal(err)
	}
	stdout.Println("Database loaded")
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	// Check if session token in cookie
	cookie, err := r.Cookie("session")
	if err != nil {
		http.Redirect(w, r, "/login.html", http.StatusFound)
		return
	}
	// Check if session token in database
	var user_id int
	var token string
	var expiry int
	err = db.QueryRow("SELECT user_id, token, expiry FROM sessions WHERE token = ?", cookie.Value).Scan(&user_id, &token, &expiry)
	if err != nil {
		http.Redirect(w, r, "/login.html", http.StatusFound)
		return
	}
	// Get user details
	var username string
	err = db.QueryRow("SELECT username FROM users WHERE id = ?", user_id).Scan(&username)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	// Get messages
	rows, err := db.Query("SELECT username, message FROM messages JOIN users ON messages.user_id = users.id")
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	var messages []Message
	for rows.Next() {
		var message Message
		err = rows.Scan(&message.Username, &message.Message)
		if err != nil {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
		messages = append(messages, message)
	}
	// Render page
	tmpl, err := template.New("index").Parse(`
		<!DOCTYPE html>
		<html>
		<head>
			<title>Messages</title>
		</head>
		<body>
			<h1>Welcome, {{.Username}}</h1>
			<h2>Messages</h2>
			<ul>
				{{range .Messages}}
					<li>{{.Username}}: {{.Message}}</li>
				{{end}}
			</ul>
			<form action="/message" method="POST">
				<textarea name="message"></textarea>
				<input type="submit" value="Send">
			</form>
			<form action="/logout" method="POST">
				<input type="submit" value="Logout">
			</form>
		</body>
		</html>
	`)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	tmpl.Execute(w, struct {
		Username string
		Messages []Message
	}{
		Username: username,
		Messages: messages,
	})
}

func registerHandler(w http.ResponseWriter, r *http.Request) {
	// Parse form
	err := r.ParseForm()
	if err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
	username := r.Form.Get("username")
	password := r.Form.Get("password")
	email := r.Form.Get("email")
	// Check if username already exists
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM users WHERE username = ?", username).Scan(&count)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	if count > 0 {
		http.Error(w, "Username already exists", http.StatusBadRequest)
		return
	}
	// Hash password
	hash, salt := HashPassword(password)
	// Insert user into database
	_, err = db.Exec("INSERT INTO users (username, hash, salt, email) VALUES (?, ?, ?, ?)", username, hash, salt, email)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	// Redirect to login page
	http.Redirect(w, r, "/login.html", http.StatusFound)
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	// Parse form
	err := r.ParseForm()
	if err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
	username := r.Form.Get("username")
	password := r.Form.Get("password")
	// Get user details
	var id int
	var hash string
	var salt string
	err = db.QueryRow("SELECT id, hash, salt FROM users WHERE username = ?", username).Scan(&id, &hash, &salt)
	if err != nil {
		http.Error(w, "Invalid username or password", http.StatusBadRequest)
		return
	}
	// Hash password
	hashed := HashPasswordWithSalt(password, salt)
	// Check password
	if hash != hashed {
		http.Error(w, "Invalid username or password", http.StatusBadRequest)
		return
	}
	// Generate session token
	token := GenerateRandomString(32)
	expiry := time.Now().Add(time.Hour).Unix()
	// Insert session into database
	_, err = db.Exec("INSERT INTO sessions (user_id, token, expiry) VALUES (?, ?, ?)", id, token, expiry)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	// Set session token in cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session",
		Value:    token,
		HttpOnly: true,
	})
	// Redirect to index page
	http.Redirect(w, r, "/", http.StatusFound)
}

func logoutHandler(w http.ResponseWriter, r *http.Request) {
	// Check if session token in cookie
	cookie, err := r.Cookie("session")
	if err != nil {
		http.Redirect(w, r, "/login.html", http.StatusFound)
		return
	}
	// Delete session from database
	_, err = db.Exec("DELETE FROM sessions WHERE token = ?", cookie.Value)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	// Delete session token from cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session",
		MaxAge:   -1,
		HttpOnly: true,
	})
	// Redirect to login page
	http.Redirect(w, r, "/login.html", http.StatusFound)
}

func HashPassword(password string) (string, string) {
	salt := GenerateRandomString(16)
	return HashPasswordWithSalt(password, salt), salt
}

func HashPasswordWithSalt(password, salt string) string {
	hash := sha256.New()
	hash.Write([]byte(password + salt))
	return hex.EncodeToString(hash.Sum(nil))
}

func GenerateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	seededRand := rand.New(rand.NewSource(time.Now().UnixNano()))
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b)
}

func messageHandler(w http.ResponseWriter, r *http.Request) {
	// Check if session token in cookie
	cookie, err := r.Cookie("session")
	if err != nil {
		http.Redirect(w, r, "/login.html", http.StatusFound)
		return
	}
	// Check if session token in database
	var user_id int
	var token string
	var expiry int
	err = db.QueryRow("SELECT user_id, token, expiry FROM sessions WHERE token = ?", cookie.Value).Scan(&user_id, &token, &expiry)
	if err != nil {
		http.Redirect(w, r, "/login.html", http.StatusFound)
		return
	}
	// Parse form
	err = r.ParseForm()
	if err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
	message := r.Form.Get("message")
	// Insert message into database
	_, err = db.Exec("INSERT INTO messages (user_id, message) VALUES (?, ?)", user_id, message)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	// Redirect to index page
	http.Redirect(w, r, "/", http.StatusFound)
}

func notFoundHandler(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "Not found", http.StatusNotFound)
}
