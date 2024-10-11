const express = require('express');
const cookieparser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const app = express();
const crypto = require('crypto');
const fs = require('fs');
app.use(cookieparser());

// Load environment variables
require('dotenv').config();

// Generate random secret key
secretKey = process.env.SECRET_KEY || crypto.randomBytes(64).toString('hex');
flag = 'Intake24{this_is_a_flag}';

// Check for "/flag.txt" and load into flag variable
if (fs.existsSync('/flag.txt')) {
		flag = fs.readFileSync('/flag.txt', 'utf8');
}

app.get('/', (req, res) => {
    if(!req.cookies || !req.cookies.token) {
        guestToken = createJWT('guest');
        res.cookie('token', guestToken);
    }else
    {
        jwt.verify(req.cookies.token, secretKey, (err, decoded) => {
            if (err) {
                res.cookie('token', createJWT('guest'));
            }
        })
    }
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/secrets', (req, res) => {
    if(!req.cookies || !req.cookies.token) {
        return res.status(401).send('No cookie found');
    }
    try {
        console.log("User sent: " + req.cookies.token);
        jwt.verify(req.cookies.token, secretKey, (err, decoded) => {
            if (err) {
                console.log(err);
                return res.status(401).send('Unauthorized');
            }
            console.log(decoded);
            if (decoded.user === 'admin') {
                res.send(flag);
            } else {
                res.status(401).send('You are not admin');
            }
        });
    } catch (err) {
        console.log(err);
        res.status(401).send('Unauthorized');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

function createJWT(user) {
    // Create JWT token
    const token = jwt.sign({ user: user }, secretKey, { expiresIn: '1h' });
    return token;
}
