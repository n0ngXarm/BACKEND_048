const jwt = require('jsonwebtoken');
const db = require('../config/db'); // เรียกตัวเชื่อม DB
const secretKey = process.env.JWT_SECRET || 'my-secret-key-ni-kab';

// ✅ ฟังก์ชัน Register
exports.register = async (req, res) => {
    try {
        const { username, password, fullname } = req.body;
        // เช็คว่าส่งข้อมูลมาครบไหม
        if (!username || !password) {
            return res.status(400).json({ message: 'กรุณากรอก Username และ Password' });
        }
        // เพิ่มลง Database จริง (tbl_customers)
        const sql = "INSERT INTO tbl_customers (username, password, fullname) VALUES (?, ?, ?)";
        await db.execute(sql, [username, password, fullname || username]);
        
        res.status(201).json({ success: true, message: 'สมัครสมาชิกสำเร็จ' });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ success: false, message: 'สมัครสมาชิกไม่สำเร็จ' });
    }
};

// ✅ ฟังก์ชัน Login (ตัวที่พี่มีปัญหา)
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("🔥 มีคน Login:", username); // เช็คว่า Log ขึ้นไหม

        // 1. เช็คจาก Database จริง (tbl_customers)
        const sql = "SELECT * FROM tbl_customers WHERE username = ?";
        const [rows] = await db.execute(sql, [username]);

        // 2. ถ้าไม่เจอ User
        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'ไม่พบชื่อผู้ใช้งานนี้' });
        }

        const user = rows[0];

        // 3. เช็ครหัสผ่าน (แบบตรงๆ ตามที่พี่เก็บไว้)
        if (password !== user.password) {
            return res.status(401).json({ success: false, message: 'รหัสผ่านไม่ถูกต้อง' });
        }

        // 4. สร้าง Token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: 'user' }, 
            secretKey,
            { expiresIn: '1d' }
        );

        res.json({ 
            success: true,
            message: 'Login successful', 
            token: token,
            user: { 
                id: user.id, 
                username: user.username, 
                fullname: user.fullname 
            } 
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'ระบบขัดข้อง' });
    }
};

// ✅ ฟังก์ชัน Logout
exports.logout = async (req, res) => {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};