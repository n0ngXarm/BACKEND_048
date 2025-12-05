const express = require('express');
const app = express();

app.use(express.json());

// จำลอง Database (In-Memory)
const users = [];

// Route 1: สร้าง Users
app.post('/users', (req, res) => {
    // รับค่าจาก Body
    const { name, email, password } = req.body;
    
    // Validate ง่ายๆ (Optional)
    if (!email || !password) {
        return res.status(400).json({ message: "Missing fields" });
    }

    // สร้าง User
    const user = { 
        id: users.length + 1, 
        name, 
        email, 
        password // ในระบบจริงต้อง Hash password ก่อน
    };
    
    users.push(user);
    res.status(201).json(user);
});

// Route 2: Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // ตรวจสอบ Email และ Password (แบบ Hardcode ตามโจทย์)
    // หรือตรวจสอบจาก Database จำลอง: const user = users.find(u => u.email === email && u.password === password);
    
    if (email === "test@mail.com" && password === "123456") {
        res.status(200).json({ token: "fake-jwt-token" });
    } else {
        res.status(401).json({ message: "Invalid creds" });
    }
});

// ส่งออก app เพื่อให้ Test เรียกใช้ (สำคัญมาก)
module.exports = app;

// สั่งรัน Server เฉพาะตอนไม่ได้รัน Test (เพื่อไม่ให้พอร์ตชนกัน)
if (require.main === module) {
    app.listen(3000, () => {
        console.log('Server running on port 3000');
    });
}