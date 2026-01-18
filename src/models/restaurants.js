const db = require('../config/db');

class Restaurant {
    static async findAll() {
        // ลองดึงข้อมูลมาดู 1 แถว
        const sql = 'SELECT * FROM tbl_restaurants';
        const [rows] = await db.query(sql);
        
        // 🔥 สั่งปริ้นดูชื่อคอลัมน์ทั้งหมดออกมาเลย
        if (rows.length > 0) {
            console.log("Existing Columns in DB:", Object.keys(rows[0])); 
        } else {
            console.log("Table is empty, cannot check columns.");
        }

        return rows;
    } // <-- added missing closing brace to end findAll()

    static async findById(id) {
        const sql = 'SELECT * FROM tbl_restaurants WHERE restaurant_id = ?'; // เช็คชื่อ ID ให้ตรงกับใน DB นะครับ
        const [rows] = await db.query(sql, [id]);
        return rows[0];
    }

    static async create(data) {
        // ✅ เพิ่ม image_url ตรงนี้
        const { restaurant_name, address, phone, menu_description, image_url } = data;

        const sql = `
            INSERT INTO tbl_restaurants (restaurant_name, address, phone, menu_description, image_url) 
            VALUES (?, ?, ?, ?, ?)
        `;
        // ✅ ส่ง image_url เข้าไปบันทึก
        const [result] = await db.query(sql, [restaurant_name, address, phone, menu_description, image_url]);
        return result.insertId;
    }

static async update(id, data) {
    // ❌ เอา image_url ออกจาก SQL ไปเลย ถ้า DB ยังไม่พร้อม
    const { restaurant_name, address, phone, menu_description } = data;
    
    const sql = `
        UPDATE tbl_restaurants 
        SET restaurant_name = ?, address = ?, phone = ?, menu_description = ?
        WHERE restaurant_id = ?
        console.log("------- DEBUG CONNECTION -------");
    console.log("Connecting to HOST:", process.env.DB_HOST);
    console.log("Connecting to PORT:", process.env.DB_PORT);
    console.log("Target Database:", process.env.DB_NAME);
    `;
    // ตัด image_url ทิ้ง
    const [result] = await db.query(sql, [restaurant_name, address, phone, menu_description, id]);
    return result.affectedRows;
}
    static async delete(id) {
        const sql = 'DELETE FROM tbl_restaurants WHERE restaurant_id = ?';
        const [result] = await db.query(sql, [id]);
        return result.affectedRows;
    }
}

module.exports = Restaurant;