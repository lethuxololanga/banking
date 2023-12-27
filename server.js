const express = require('express');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

// Create a file-based SQLite database
const db = new sqlite3.Database('banking_database.db');

// Create a database in-memory (for demo purposes; in production, use a file-based database)
// const db = new sqlite3.Database(':memory:');

// Create users table

// Initialize the database and create tables
db.serialize(() => {
db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, balance REAL)');

console.log('Database initialized');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Assuming your HTML, CSS, and JS files are in a 'public' folder

// Middleware for authentication
app.use(async (req, res, next) => {
    // Implement session management or token-based authentication here
    // For simplicity, let's assume the user is always authenticated
    next();
});

// Routes

// Signup route
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the username already exists
        const existingUser = await getUserByUsername(username);
        if (existingUser) {
            return res.status(400).send('Username already exists. Please choose another username.');
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        await createUser(username, hashedPassword);

        res.send('Account created successfully.');
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await getUserByUsername(username);

        if (!user) {
            console.log('User not found.');
            return res.status(404).send('User not found.');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            console.log('Password mismatch.');
            return res.status(401).send('Invalid username or password.');
        }

        console.log('Login successful:', user.username);
        res.json({ username: user.username, balance: user.balance });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
});




// Check if a username already exists
app.post('/checkUsername', async (req, res) => {
    const { username } = req.body;

    try {
        const existingUser = await getUserByUsername(username);
        res.json({ exists: !!existingUser });
    } catch (error) {
        console.error('Error during username check:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Deposit route
app.post('/deposit', async (req, res) => {
    const { username, amount } = req.body;

    try {
        // Check if the user exists
        const user = await getUserByUsername(username);
        if (!user) {
            return res.status(404).send('User not found.');
        }

        const currentBalance = user.balance;
        const newBalance = currentBalance + parseFloat(amount);

        // Update the user's balance
        await updateUserBalance(username, newBalance);

        res.json({ username, balance: newBalance });
    } catch (error) {
        console.error('Error during deposit:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Implement other routes as needed

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// Database functions

async function getUserByUsername(username) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) {
                reject(err);
            } else {
                console.log('User data retrieved:', row);
                resolve(row);
            }
        });
    });
}


async function createUser(username, password) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO users (username, password, balance) VALUES (?, ?, 0)', [username, password], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

async function updateUserBalance(username, balance) {
    return new Promise((resolve, reject) => {
        db.run('UPDATE users SET balance = ? WHERE username = ?', [balance, username], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
