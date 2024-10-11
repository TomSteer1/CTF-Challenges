const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const sessions = require('express-session');
const crypto = require('crypto');
const { exit } = require('process');
const expressFileUpload = require('express-fileupload');
const fs = require('fs');

const adminPssword = "6c06e5381c148de62147053057fa96bac03712d0"
console.log('Admin password: ' + adminPssword);

const db = new sqlite3.Database('/tmp/bank.db', (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
        exit(1);
    } else {
        console.log('Connected to the bank database.');
        // Create table if it doesn't exist
        const sql = 'CREATE TABLE IF NOT EXISTS admin_users (username TEXT PRIMARY KEY, password TEXT)';
        db.run(sql, (err) => {
            if (err) {
                return console.error(err.message);
            }
            const sql2 = 'INSERT OR IGNORE INTO admin_users (username, password) VALUES (?, ?)';
            const hashedPassword = hashPassword(adminPssword);
            db.run(sql2, ['admin', hashedPassword], (err) => {
                if (err) {
                    return console.error(err.message);
                }
            });
        });

    }
})

function hashPassword(password) {
    hash = crypto.createHash('sha256');
    hash.update(password);
    return hash.digest('hex');
}


// Enable sessions

app.use(sessions({
    secret: crypto.randomBytes(20).toString('hex'),
    resave: false,
    saveUninitialized: false,
}));

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/login.html');
    } else {
        next();
    }
}

// Middleware to check if user is logged out
app.use((req, res, next) => {
    if (req.url === "/admin.html") {
        return res.redirect('/admin');
    }
    if (req.session.authenticated || req.method === 'POST' || req.url === '/login.html' || req.url === '/') {
        next();
    } else {
        res.redirect('/login.html');
    }
});

// Send static files in public directory
app.use(express.static('./public'));

// Enable file upload
app.use(expressFileUpload());

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        res.redirect('/login.html');
    }
    const hashedPassword = hashPassword(password);
    const sql = 'SELECT * FROM admin_users WHERE username = ? AND password = ?';
    db.get(sql, [username, hashedPassword], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.send('Error');
        }
        if (row) {
            req.session.authenticated = true;
            req.session.username = username
            res.redirect('/admin');
        } else {
            res.redirect('/login.html');
        }
    });
})

app.get('/users', isAuthenticated, (req, res) => {
    const sql = 'SELECT * FROM bank_users JOIN bank_accounts ON bank_users.username = bank_accounts.username';
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.send('Error');
        }
        const users = rows.map(row => {
            return {
                username: row.username,
                balance: row.balance,
                account_number: row.account_number,
                approved : row.approved
            }
        });
        res.json(users);
    });
});

app.post('/approve', isAuthenticated, (req, res) => {
    const username = req.body.username;
    const sql = 'UPDATE bank_users SET approved = 1 WHERE username = ?';
    db.run(sql, [username], (err) => {
        if (err) {
            console.error(err.message);
            return res.send('Error');
        }
        res.send('OK');
    });
});

app.get('/admin', isAuthenticated, (req, res) => {
    const sql = 'SELECT * FROM bank_transactions';
    var transactions = [];
    var users = [];
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.send('Error');
        }
        transactions = rows.map(row => {
            return {
                username: row.username,
                amount: row.amount,
                message: row.message,
                timestamp: row.timestamp
            }
        }); 
        const sql2 = 'SELECT * FROM bank_users JOIN bank_accounts ON bank_users.username = bank_accounts.username';
        db.all(sql2, [], (err, rows) => {
            if (err) {
                console.error(err.message);
                return res.send('Error');
            }
            users = rows.map(row => {
                return {
                    username: row.username,
                    balance: row.balance,
                    account_number: row.account_number,
                    approved : row.approved
                }
            });
            // Open admin.html
            fs.readFile('./public/admin.html', 'utf8', (err, data) => {
                if (err) {
                    console.error(err.message);
                    return res.send('Error');
                }
                // Create table rows for users
                var usersTable = '';
                users.forEach(user => {
                    usersTable += `<tr><td>${user.username}</td><td>${user.account_number}</td><td>£${user.balance}</td>`;
                    if (user.approved) {
                        usersTable += `<td style="background-color: lightgreen">Approved</td>`;
                    } else {
                        usersTable += `<td style="background-color: red">Not approved</td>`;
                    }
                    usersTable += '</tr>';
                });
                // Create table rows for transactions
                var transactionsTable = '';
                transactions.forEach(transaction => {
                    transactionsTable += `<tr><td>${transaction.username}</td><td>${transaction.amount}</td><td>${transaction.message}</td><td>${transaction.timestamp}</td></tr>`;
                });
                // Replace placeholders in admin.html with data
                data = data.replace('{{users}}', usersTable);
                data = data.replace('{{transactions}}', transactionsTable);
                res.send(data);
            });
        });
    });
});

app.post('/deny', isAuthenticated, (req, res) => {
    const username = req.body.username;
    const sql = 'DELETE FROM bank_users WHERE username = ?';
    db.run(sql, [username], (err) => {
        if (err) {
            console.error(err.message);
            return res.send('Error');
        }
        res.send('OK');
    });
});

app.get('/uploads', isAuthenticated, (req, res) => {
    const username = req.query.username;
    const sql = 'SELECT * FROM bank_users WHERE username = ?';
    db.get(sql, [username], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.send('An error occurred');
        }
        if (!row) {
            return res.send('Error user not found');
        }
        const filePath = row.id_file;
        if (!filePath) {
            return res.send('Error' + username + ' has not uploaded an ID');
        }
        const path = require('path');
        const normalizedPath = path.normalize("/tmp/files/" + username + "/" + filePath);
        console.log('Normalized path: ' + normalizedPath);
        res.sendFile(normalizedPath);
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});