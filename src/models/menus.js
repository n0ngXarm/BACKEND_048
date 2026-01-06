const db = require('../config/db');

class Menu {
    static async findAll() {
        const sql = 'SELECT * FROM tbl_menus';
        const [rows] = await db.execute(sql);
        return rows;
    }

    static async create(menuData) {
        const { menu_name, price, image } = menuData;
        const sql = 'INSERT INTO tbl_menus (menu_name, price, image) VALUES (?, ?, ?)';
        const [result] = await db.execute(sql, [menu_name, price, image]);
        return result.insertId;
    }
}

module.exports = Menu;