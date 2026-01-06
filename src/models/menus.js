// src/models/menus.js
const db = require('../config/db');

class Menu {
    // ดึงเมนูทั้งหมด
    static async findAll() {
        const sql = 'SELECT * FROM tbl_menus';
        const [rows] = await db.execute(sql);
        return rows;
    }

    // ดึงเมนูตาม ID
    static async findById(id) {
        const sql = 'SELECT * FROM tbl_menus WHERE id = ?'; // เช็คชื่อ column id ใน db อีกทีนะครับ
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    }

    // เพิ่มเมนูใหม่
    static async create(menuData) {
        // สมมติ column: name, price, description, image_url
        const sql = 'INSERT INTO tbl_menus (menu_name, price, image) VALUES (?, ?, ?)'; 
        const [result] = await db.execute(sql, [
            menuData.menu_name, 
            menuData.price, 
            menuData.image
        ]);
        return result.insertId;
    }
}

module.exports = Menu;