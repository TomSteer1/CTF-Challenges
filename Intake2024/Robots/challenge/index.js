const express = require("express")
const sqlite3 = require("sqlite3")
const crypto = require("crypto")
const fs = require("fs")

//const db = new sqlite3.Database("./database.sqlite")
// Create db in memory
const db = new sqlite3.Database(":memory:")
const app = express()

let tokens = {}

const flag = fs.readFileSync("flag.txt", "utf-8")

var keyRaw = "12CFEFB6274EF47B74A600622D5B5E45B4F22F4FECDD033F8AF17F1C703BDFF5"
var ivRaw = "05166FB98E1A43672256C6D6046D0AA2"

var key = Buffer.from(keyRaw, "hex")
var iv = Buffer.from(ivRaw, "hex")

app.use(express.static("public"))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use((req, res, next) => {
	// Check User Agent is robots/1.0
	if (req.get("User-Agent") != "robots/1.0") {
		res.status(403).send("")
	} else {
		next()
	}
})

function generateToken(username) {
	let token = crypto.randomBytes(16).toString("hex")
	tokens[token] = username
	return token
}

db.serialize(() => {
	// Create table
	db.run("CREATE TABLE IF NOT EXISTS users (username TEXT, password TEXT)")
	// Generate random user
	db.run("INSERT INTO users (username, password) VALUES ('administrator', '" + crypto.randomBytes(16).toString("hex") + "')")
})

app.post("/login", (req, res) => {
	// Parse application/json

	let username = req.body.username || ""
	let password = req.body.password || ""
	console.log("Login attempt: " + username + " " + password)
	let sql = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password+ "'"
	db.get(sql, [], (err, row) => {
		if (err) {
			res.status(500).send("")
			return console.error(err.message)
		}
		if (row) {
			let token = generateToken(row.username)
			res.send(token)
		} else {
			res.status(401).send("")
		}
	})
})

app.get("/me", (req, res) => {
	// Get token from header
	let token = req.get("Authorization")
	token = token && token.split(" ")[1]
	if (token && tokens[token]) {
		res.send(tokens[token])
	} else {
		res.send("Invalid token")
	}
})

app.post("/decryptFlag", (req, res) => {
	// Get token from header
	let token = req.get("Authorization")
	token = token && token.split(" ")[1]
	if (token && tokens[token] === "administrator") {
		let encryptedFlag = req.body.encryptedFlag
		let decipher = crypto.createDecipheriv("aes-256-cbc", key, iv)
		let decryptedFlag = decipher.update(encryptedFlag, "hex", "utf8") + decipher.final("utf8")
		res.send(decryptedFlag)
	} else {
		console.log("Invalid token")
		res.send("Invalid token")
	}
})

app.listen(8080, () => {})
