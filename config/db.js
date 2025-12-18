const mysql = require('mysql2');
require('dotenv').config();

// ใช้ createPool แทน createConnection (ดีกว่ามากกกก)
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// เช็คว่าเชื่อมต่อได้ไหม
db.getConnection((err, connection) => {
    if (err) {
        console.log("❌ DB Connection Failed:", err.message);
    } else {
        console.log("✅ Database Connected (Pool Mode)!");
        connection.release(); // คืน connection กลับเข้า pool
    }
});

module.exports = db;