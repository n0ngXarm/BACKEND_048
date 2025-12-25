const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM tbl_users WHERE email = ? OR username = ? LIMIT 1', [email, email]);
        const user = rows[0];
        if (!user) return res.status(404).json({ message: 'User not found' });

        const match = await bcrypt.compare(password || '', user.password || '');
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });

        // Minimal token (replace with real JWT if available)
        return res.status(200).json({
            message: 'Login successful',
            token: 'fake-jwt-token-' + user.id
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Login failed' });
    }
});

module.exports = router;