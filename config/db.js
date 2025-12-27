const mysql = require('mysql2/promise');
require('dotenv').config();

// สร้าง Pool การเชื่อมต่อ
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ✅ เช็คการเชื่อมต่อแบบถูกต้อง (สำหรับ Promise)
pool.getConnection()
    .then(connection => {
        console.log("✅ Database Connected (Promise Mode)!");
        connection.release(); // คืน Connection กลับเข้า Pool
    })
    .catch(err => {
        console.error("❌ Database Connection Failed:");
        console.error("   Code:", err.code);
        console.error("   Message:", err.message);
    });

module.exports = pool;