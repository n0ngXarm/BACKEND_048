const jwt = require('jsonwebtoken');

// ข้อ 2.3: Middleware ตรวจสอบ Token [2 คะแนน]
const verifyToken = (req, res, next) => {
  // อ่าน token จาก header ชื่อ Authorization
  const authHeader = req.headers['authorization'];
  
  // ตัดคำว่า "Bearer " ออกเพื่อเอาเฉพาะ Token
  const token = authHeader && authHeader.split(' ')[1];

  // ถ้าไม่มี token -> 401 Unauthorized (ตามโจทย์)
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  // ตรวจสอบ token ด้วย jwt.verify()
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // เก็บข้อมูล user ไว้ใช้ต่อใน req
    next(); // ผ่าน ไปยัง API ถัดไป
  } catch (err) {
    // หากไม่ผ่าน -> 401 Unauthorized (หรือ 403 Forbidden)
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = verifyToken;