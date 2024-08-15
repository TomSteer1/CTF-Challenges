const express = require("express")
const sqlite3 = require("sqlite3")
const crypto = require("crypto")
const fs = require("fs")

//const db = new sqlite3.Database("./database.sqlite")
// Create db in memory
const db = new sqlite3.Database(":memory:")
const app = express()

const flag = fs.readFileSync("flag.txt", "utf-8")

app.use(express.static("public"))
app.use(express.urlencoded({ extended: false }))

db.serialize(() => {
	// Create table
	db.run("CREATE TABLE IF NOT EXISTS users (username TEXT, password TEXT)")
	// Generate random user
	db.run("INSERT INTO users (username, password) VALUES ('" + crypto.randomBytes(16).toString("hex") + "', '" + crypto.randomBytes(16).toString("hex") + "')")
})

app.post("/login", (req, res) => {
	let username = req.body.username || ""
	let password = req.body.password || ""
	let sql = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password+ "'"
	db.get(sql, [], (err, row) => {
		if (err) {
			res.send("Login failed")
			return console.error(err.message)
		}
		if (row) {
			res.send(flag)
		} else {
			res.send("Login failed")
		}
	})
})

app.listen(3000, () => {})
