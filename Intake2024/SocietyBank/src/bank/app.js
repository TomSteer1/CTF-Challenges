const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const sessions = require('express-session');
const crypto = require('crypto');
const { exit } = require('process');
const expressFileUpload = require('express-fileupload');
const fs = require('fs');

const db = new sqlite3.Database('/tmp/bank.db', (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
        exit(1);
    } else {
        console.log('Connected to the bank database.');
        // Create table if it doesn't exist
        const sql = 'CREATE TABLE IF NOT EXISTS bank_users (username TEXT PRIMARY KEY, password TEXT, id_file TEXT, approved BOOLEAN DEFAULT FALSE)';
        db.run(sql, (err) => {
            if (err) {
                return console.error(err.message);
            }
            // Create 3 random users
            const sql2 = 'INSERT OR IGNORE INTO bank_users (username, password, id_file, approved) VALUES (?, ?, ?, TRUE)';

            db.run(sql2, ['alice', hashPassword(crypto.randomBytes(20).toString('hex')), 'alice_id.jpg'], (err) => {
                if (err) {
                    return console.error(err.message);
                }
                // Create id file
                fs.mkdir('/tmp/files/alice', { recursive: true }, (err) => {
                    if (err) {
                        console.error(err.message);
                        return
                    }
                    fs.writeFile('/tmp/files/alice/alice_id.jpg', 'Alice ID', (err) => {
                        if (err) {
                            console.error(err.message);
                            return
                        }
                    });
                });
            });
            db.run(sql2, ['bob', hashPassword(crypto.randomBytes(20).toString('hex')), 'bob_id.jpg'], (err) => {
                if (err) {
                    return console.error(err.message);
                }
                // Create id file
                fs.mkdir('/tmp/files/bob', { recursive: true }, (err) => {
                    if (err) {
                        console.error(err.message);
                        return
                    }
                    fs.writeFile('/tmp/files/bob/bob_id.jpg', 'Bob ID', (err) => {
                        if (err) {
                            console.error(err.message);
                            return
                        }
                    });
                });
            });
            db.run(sql2, ['charlie', hashPassword(crypto.randomBytes(20).toString('hex')), 'charlie_id.jpg'], (err) => {
                if (err) {
                    return console.error(err.message);
                }
                // Create id file
                fs.mkdir('/tmp/files/charlie', { recursive: true }, (err) => {
                    if (err) {
                        console.error(err.message);
                        return
                    }

                    fs.writeFile('/tmp/files/charlie/charlie_id.jpg', 'Charlie ID', (err) => {
                        if (err) {
                            console.error(err.message);
                            return
                        }
                    });
                });
            });
        });
        const sql2 = 'CREATE TABLE IF NOT EXISTS bank_accounts (username TEXT PRIMARY KEY, account_number INTEGER, balance INTEGER)';
        db.run(sql2, (err) => {
            if (err) {
                return console.error(err.message);
            }
            // Create 3 random accounts
            const sql3 = 'INSERT OR IGNORE INTO bank_accounts (username, account_number, balance) VALUES (?, ?, ?)';
            db.run(sql3, ['alice', Math.floor(Math.random() * 1000000000), 1000], (err) => {
                if (err) {
                    return console.error(err.message);
                }
            });
            db.run(sql3, ['bob', Math.floor(Math.random() * 1000000000), 1000], (err) => {
                if (err) {
                    return console.error(err.message);
                }
            });
            db.run(sql3, ['charlie', Math.floor(Math.random() * 1000000000), 1000], (err) => {
                if (err) {
                    return console.error(err.message);
                }
            });
        });
        const sql3 = 'CREATE TABLE IF NOT EXISTS bank_transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, amount INTEGER, timestamp TEXT, message TEXT, type TEXT)';
        db.run(sql3, (err) => {
            if (err) {
                return console.error(err.message);
            }
            // Create 3 random transactions
            const sql4 = 'INSERT OR IGNORE INTO bank_transactions (username, amount, timestamp, message, type) VALUES (?, ?, ?, ?, ?)';
            db.run(sql4, ['alice', 1000, new Date().toISOString(), 'Initial deposit', 'deposit'], (err) => {
                if (err) {
                    return console.error(err.message);
                }
            });
            db.run(sql4, ['bob', 1000, new Date().toISOString(), 'Initial deposit', 'deposit'], (err) => {
                if (err) {
                    return console.error(err.message);
                }
            });
            db.run(sql4, ['charlie', 1000, new Date().toISOString(), 'Initial deposit', 'deposit'], (err) => {
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
    saveUninitialized: false
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
    if (req.session.authenticated || req.method === 'POST' || req.url === '/login.html' || req.url === '/register.html' || req.url === '/') {
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
    const sql = 'SELECT * FROM bank_users WHERE username = ? AND password = ?';
    db.get(sql, [username, hashedPassword], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.send('Error');
        }
        if (row) {
            if (row.approved) {
                req.session.authenticated = true;
                req.session.username = username
                res.redirect('/account.html');
            } else {
                res.send('Account not approved\n Please wait for approval from admin');
            }
        } else {
            res.redirect('/login.html');
        }
    });
})

app.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const id_file = req.body.id_file;
    if (!username || !password) {
        res.redirect('/register.html');
    }
    const hashedPassword = hashPassword(password);
    // Check if username already exists
    const sql = 'SELECT * FROM bank_users WHERE username = ?';
    db.get(sql, [username], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.send('Error');
        }
        if (row) {
            res.redirect('/register.html');
        } else {
            console.log('Registering user ' + username);
            // Handle file upload
            if (req.files) {
                const id_file = req.files.id_file;
                console.log(id_file);
                const fileName = id_file.name;
                const sql2 = 'INSERT INTO bank_users (username, password, id_file) VALUES (?, ?, ?)';
                db.run(sql2, [username, hashedPassword, fileName], (err) => {
                    if (err) {
                        console.error(err.message);
                        return res.send('Error');
                    }
                    const sql3 = 'INSERT INTO bank_accounts (username, account_number, balance) VALUES (?, ?, ?)';
                    db.run(sql3, [username, Math.floor(Math.random() * 1000000000), 0], (err) => {
                        if (err) {
                            console.error(err.message);
                            return res.send('Error');
                        }
                        // Make directory if it doesn't exist
                        fs.mkdir('/tmp/files/' + username, { recursive: true }, (err) => {
                            if (err) {
                                console.error(err.message);
                                return res.send('Error');
                            }
                            id_file.mv('/tmp/files/' + username + '/' + fileName, (err) => {
                                if (err) {
                                    console.error(err.message);
                                    return res.send('Error');
                                }
                            });
                        });
                    });
                    res.redirect('/login.html');
                });
            } else {
                return res.send('Error - no file uploaded');
            }
        }
    });
});

app.get('/account-details', isAuthenticated, (req, res) => {
    const sql = 'SELECT * FROM bank_accounts WHERE username = ?';
    db.get(sql, [req.session.username], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.send('Error');
        }
        const account = {
            username: row.username,
            account_number: row.account_number,
            balance: row.balance
        }
        const sql2 = 'SELECT * FROM bank_transactions WHERE username = ?';
        db.all(sql2, [req.session.username], (err, rows) => {
            if (err) {
                return console.error(err.message);
            }
            const transactions = rows;
            res.json({ account, transactions });
        });
    });
})

app.post('/deposit', isAuthenticated, (req, res) => {
    const amount = req.body.amount;
    const message = req.body.message || 'Deposit';
    if (!amount) {
        res.redirect('/account.html');
    }
    const sql = 'UPDATE bank_accounts SET balance = balance + ? WHERE username = ?;';
    db.run(sql, [amount, req.session.username], (err) => {
        if (err) {
            console.error(err.message);
            return res.send('Error');
        }
        const sql2 = 'INSERT INTO bank_transactions (username, amount, timestamp, message, type) VALUES (?, ?, ?, ?, ?)';
        db.run(sql2, [req.session.username, amount, new Date().toISOString(), message, 'deposit'], (err) => {
            if (err) {
                console.error(err.message);
                return res.send('Error');
            }
            res.redirect('/account.html');
        });
    });
})

app.post('/withdraw', isAuthenticated, (req, res) => {
    const amount = req.body.amount;
    const message = req.body.message || 'Withdraw';
    if (!amount) {
        res.redirect('/account.html');
    }
    const sql = 'UPDATE bank_accounts SET balance = balance - ? WHERE username = ?;';
    db.run(sql, [amount, req.session.username], (err) => {
        if (err) {
            console.error(err.message);
            return res.send('Error');
        }
        const sql2 = 'INSERT INTO bank_transactions (username, amount, timestamp, message, type) VALUES (?, ?, ?, ?, ?)';
        db.run(sql2, [req.session.username, amount, new Date().toISOString(), message, 'withdraw'], (err) => {
            if (err) {
                console.error(err.message);
                return res.send('Error');
            }
            res.redirect('/account.html');
        });
    });
});



app.listen(3001, () => {
    console.log('Server is running on port 3001');
});