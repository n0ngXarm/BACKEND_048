const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// เชื่อมต่อและดักจับ Error
db.connect((err) => {
    if (err) {
        console.log("⚠️  DB Connection Failed:", err.message);
    } else {
        console.log("✅ Database Connected!");
    }
});

// ป้องกัน App พังเมื่อเน็ตหลุด
db.on('error', (err) => {
    console.log("❌ DB Error:", err.message);
});

module.exports = db;