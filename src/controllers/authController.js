const Customer = require('../models/customerModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
exports.register = async (req, res) => {
    try {
        const { fullname, username, password, email, phone_number, address } = req.body;

        // เช็คว่ามี user นี้หรือยัง (Optional: ไปทำเพิ่มได้)

        // เข้ารหัส Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // บันทึกลง Database
        await Customer.create({
            fullname, username, password: hashedPassword, email, phone_number, address
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // หา User
        const user = await Customer.findByUsername(username);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // เช็ค Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // สร้าง JWT Token
        const token = jwt.sign(
            { id: user.id, role: user.status || 'customer' }, // user.status คือ admin/user
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ 
            message: 'Login successful',
            token,
            user: { id: user.id, username: user.username, fullname: user.fullname }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};