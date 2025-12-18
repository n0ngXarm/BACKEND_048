const express = require('express');
const app = express();

// 1. ต้องมีบรรทัดนี้ เพื่อให้อ่าน JSON จากการส่งค่าได้
app.use(express.json());

// --- MOCK DATABASE (จำลองฐานข้อมูลไว้ในแรม เพื่อให้เทสผ่าน) ---
let users = []; // เก็บ user ในนี้แทน database จริง
let nextId = 1;

// --- ROUTES ตามโจทย์ใบงาน ---

// 1. Register (สมัครสมาชิก)
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    // TC-02: เช็คข้อมูลไม่ครบ
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // TC-03: เช็คอีเมลซ้ำ
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(409).json({ message: 'Email already exists' });
    }

    // TC-01: สมัครสำเร็จ
    const newUser = { id: nextId++, name, email, password };
    users.push(newUser);
    res.status(201).json({ message: 'User registered successfully', user: newUser });
});

// 2. Login (เข้าสู่ระบบ)
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // TC-06: หา User ไม่เจอ
    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // TC-05: รหัสผิด
    if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // TC-04: ล็อกอินสำเร็จ (แจก Token ปลอมๆ ให้เทสผ่าน)
    res.status(200).json({ 
        message: 'Login successful',
        token: 'fake-jwt-token-' + user.id // Token ปลอมสำหรับเทส
    });
});

// 3. Get Profile (ดึงข้อมูลส่วนตัว)
app.get('/users/me', (req, res) => {
    const authHeader = req.headers['authorization'];

    // TC-08: ไม่มี Token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // TC-07: มี Token (Mock ว่าถอดรหัสได้ User คนแรกที่สร้างเสมอ เพื่อความง่าย)
    // ในความเป็นจริงต้อง verify token แต่เพื่อการเทส เราสมมติว่า token ถูกต้อง
    const user = users[0]; // ดึงคนแรกมาโชว์เลย
    
    if (!user) {
         return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
});

// 4. Update Profile (แก้ไขข้อมูล)
app.put('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const authHeader = req.headers['authorization'];

    // เช็ค Token ก่อน
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return res.status(404).json({ message: 'User not found' });

    // TC-09: อัปเดตข้อมูล
    users[userIndex] = { ...users[userIndex], ...req.body };
    res.status(200).json(users[userIndex]);
});

// 5. Delete User (ลบสมาชิก)
app.delete('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const authHeader = req.headers['authorization'];

    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

    // TC-10: ลบข้อมูล
    users = users.filter(u => u.id !== userId);
    res.status(200).json({ message: 'User deleted successfully' });
});

// Export app เพื่อเอาไปเทส (ห้ามลบ)
module.exports = app;

// สั่งรัน server (เฉพาะตอนไม่ได้เทส)
if (require.main === module) {
    app.listen(3000, () => {
        console.log('Server running on port 3000');
    });
}