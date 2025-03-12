const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Hardcoded user which you provided
const validUser = {
    username: 'admin',
    password: 'password123'
};

//im gonna take somthing random
const JWT_SECRET = 'suryansh-is-my-secret-key';

// Login Endpoint
router.post('/', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    if (username === validUser.username && password === validUser.password) {
        const token = jwt.sign({ username: validUser.username }, JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ token });
    } else {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
});

module.exports = router;