const db = require('../config/db');

class Restaurant {
    static async findAll() {
        const sql = 'SELECT * FROM tbl_restaurants';
        const [rows] = await db.query(sql);
        return rows;
    }

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
        // ✅ เพิ่ม image_url ตรงนี้ด้วย
        const { restaurant_name, address, phone, menu_description, image_url } = data;
        
        const sql = `
            UPDATE tbl_restaurants 
            SET restaurant_name = ?, address = ?, phone = ?, menu_description = ?, image_url = ?
            WHERE restaurant_id = ?
        `;
        // ✅ ส่ง image_url ไปอัปเดต
        const [result] = await db.query(sql, [restaurant_name, address, phone, menu_description, image_url, id]);
        return result.affectedRows;
    }

    static async delete(id) {
        const sql = 'DELETE FROM tbl_restaurants WHERE restaurant_id = ?';
        const [result] = await db.query(sql, [id]);
        return result.affectedRows;
    }
}

module.exports = Restaurant;