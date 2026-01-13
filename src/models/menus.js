const db = require('../config/db');

class Menu {
    static async findAll() {
        const sql = 'SELECT * FROM tbl_menus';
        const [rows] = await db.query(sql);
        return rows;
    }

    static async findById(id) {
        const sql = 'SELECT * FROM tbl_menus WHERE menu_id = ?'; // ระวัง! Database พี่ใช้ menu_id ไม่ใช่ id เฉยๆ
        const [rows] = await db.query(sql, [id]);
        return rows[0];
    }

    static async create(menuData) {
        const { menu_name, description, price, category, restaurant_id } = menuData;
        
        // ถ้าไม่ส่ง restaurant_id มา ให้ Default เป็น 1 ไปก่อน
        const resId = restaurant_id || 1;

        const sql = `
            INSERT INTO tbl_menus (restaurant_id, menu_name, description, price, category) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(sql, [resId, menu_name, description, price, category]);
        return result.insertId;
    }

    static async update(id, data) {
        const { menu_name, description, price, category } = data;
        const sql = `
            UPDATE tbl_menus 
            SET menu_name = ?, description = ?, price = ?, category = ? 
            WHERE menu_id = ?
        `;
        const [result] = await db.query(sql, [menu_name, description, price, category, id]);
        return result.affectedRows;
    }

    static async delete(id) {
        const sql = 'DELETE FROM tbl_menus WHERE menu_id = ?';
        const [result] = await db.query(sql, [id]);
        return result.affectedRows;
    }
}

module.exports = Menu;