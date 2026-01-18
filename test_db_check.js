// ไฟล์ test_db_check.js
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// โหลดค่าจาก .env
dotenv.config();

async function checkDatabase() {
    console.log("\n🔍 ---------- เริ่มตรวจสอบ Database ----------");
    console.log("📡 กำลังเชื่อมต่อไปที่ IP:", process.env.DB_HOST);
    console.log("🔌 Port:", process.env.DB_PORT);
    console.log("🗄️  ชื่อ Database:", process.env.DB_NAME);

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        console.log("✅ เชื่อมต่อสำเร็จ! (Connection OK)");

        // เช็คว่ามีคอลัมน์ image_url ในตาราง tbl_restaurants จริงไหม?
        const [rows] = await connection.execute("SHOW COLUMNS FROM tbl_restaurants LIKE 'image_url'");

        if (rows.length > 0) {
            console.log("✅ เจอคอลัมน์ 'image_url' แล้ว! (พร้อมใช้งาน)");
            console.log("📝 ประเภทข้อมูล:", rows[0].Type);
        } else {
            console.log("❌ ไม่เจอคอลัมน์ 'image_url' !!!");
            console.log("⚠️  Database ที่โค้ดเชื่อมต่ออยู่ **ยังไม่มีช่องเก็บรูป** ครับ");
            console.log("👉 พี่อาจจะไปแก้ผิด Database หรือผิดตารางแน่นอน");
        }

        await connection.end();
    } catch (error) {
        console.log("❌ เชื่อมต่อไม่ได้เลย Error:", error.message);
    }
    console.log("--------------------------------------------\n");
}

checkDatabase();