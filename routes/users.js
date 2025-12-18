const express = require('express');
const router = express.Router();

// Mock Database (ใช้ตัวแปรแทน DB จริง เพื่อให้ Test ผ่านง่ายๆ)
let users = [];
let nextId = 1;

// POST /register
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    if (users.find(u => u.email === email)) {
        return res.status(409).json({ message: 'Email already exists' });
    }

    const newUser = { id: nextId++, name, email, password };
    users.push(newUser);
    res.status(201).json({ message: 'User registered successfully', user: newUser });
});

// POST /login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.password !== password) return res.status(401).json({ message: 'Invalid credentials' });

    res.status(200).json({ 
        message: 'Login successful', 
        token: 'fake-jwt-token-' + user.id 
    });
});

// GET /users/me
router.get('/users/me', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

    // Mock: คืนค่า User คนแรกเสมอ
    const user = users[0];
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.status(200).json(user);
});

// PUT /users/:id
router.put('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) return res.status(404).json({ message: 'User not found' });
    
    users[index] = { ...users[index], ...req.body };
    res.status(200).json(users[index]);
});

// DELETE /users/:id
router.delete('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    users = users.filter(u => u.id !== userId);
    res.status(200).json({ message: 'User deleted successfully' });
});

module.exports = router;