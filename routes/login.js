const express = require('express');
const router = express.Router();
const db = require('../config/db'); 

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // 1. หา User จาก email
    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // 2. เช็ค Password
    if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Login ผ่าน -> ส่ง Token ปลอมกลับไป
    res.status(200).json({ 
        message: 'Login successful', 
        token: 'fake-jwt-token-' + user.id 
    });
});

module.exports = router;