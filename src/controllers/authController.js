// src/controllers/authController.js
const User = require('../models/users'); // ตรวจสอบว่ามีไฟล์ models/users.js จริงไหม

exports.register = async (req, res) => {
    try {
        const { username, password, email, role } = req.body;
        
        // เช็คว่าส่งข้อมูลมาครบไหม
        if (!username || !password || !email) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // สร้าง user
        const userData = { username, password, email, role };
        const userId = await User.create(userData);
        
        res.status(201).json({ 
            success: true,
            message: 'User registered successfully', 
            userId 
        });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ success: false, message: 'Register failed' });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findByUsername(username);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.password !== password) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        res.json({ 
            success: true,
            message: 'Login successful', 
            user: { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            } 
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
};
exports.logout = async (req, res) => {
    try {
        // ในระบบ JWT ปกติเราไม่ต้องทำอะไรฝั่ง Server มากนัก
        // แค่บอก Client ให้ลบ Token ทิ้ง
        res.status(200).json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Logout failed' });
    }
};