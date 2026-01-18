const db = require('../config/db');

class Menu {
    static async findAll() {
        const sql = 'SELECT * FROM tbl_menus';
        const [rows] = await db.query(sql);
        return rows;
    }

    static async findById(id) {
        const sql = 'SELECT * FROM tbl_menus WHERE menu_id = ?';
        const [rows] = await db.query(sql, [id]);
        return rows[0];
    }

    static async create(menuData) {
        // ✅ เพิ่มการรับค่า image_url
        const { menu_name, description, price, category, restaurant_id, image_url } = menuData;
        
        const resId = restaurant_id || 1;

        // ✅ เพิ่ม image_url เข้าไปใน INSERT
        const sql = `
            INSERT INTO tbl_menus (restaurant_id, menu_name, description, price, category, image_url) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        // ✅ เพิ่ม image_url เข้าไปใน array พารามิเตอร์ (ตัวสุดท้าย)
        const [result] = await db.query(sql, [resId, menu_name, description, price, category, image_url]);
        return result.insertId;
    }

    static async update(id, data) {
        // ✅ เพิ่มการรับค่า image_url
        const { menu_name, description, price, category, image_url } = data;
        
        // ✅ เพิ่ม image_url เข้าไปใน UPDATE
        const sql = `
            UPDATE tbl_menus 
            SET menu_name = ?, description = ?, price = ?, category = ?, image_url = ?
            WHERE menu_id = ?
        `;
        // ✅ เพิ่ม image_url เข้าไปใน array พารามิเตอร์
        const [result] = await db.query(sql, [menu_name, description, price, category, image_url, id]);
        return result.affectedRows;
    }

    static async delete(id) {
        const sql = 'DELETE FROM tbl_menus WHERE menu_id = ?';
        const [result] = await db.query(sql, [id]);
        return result.affectedRows;
    }
}

module.exports = Menu;