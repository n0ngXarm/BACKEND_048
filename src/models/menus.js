const db = require('../config/db');

class Menu {
    static async findAll() {
        try {
            const sql = 'SELECT menu_id, restaurant_id, menu_name, description, price, category, image_url FROM tbl_menus';
            const [rows] = await db.query(sql);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const sql = 'SELECT * FROM tbl_menus WHERE menu_id = ?';
            const [rows] = await db.query(sql, [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async create(menuData) {
        try {
            const { menu_name, description, price, category, restaurant_id, image_url } = menuData;
            const resId = restaurant_id || 1;
            const sql = 'INSERT INTO tbl_menus (restaurant_id, menu_name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?, ?)';
            const [result] = await db.query(sql, [resId, menu_name, description, price, category, image_url]);
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, data) {
        try {
            const { menu_name, description, price, category, image_url } = data;
            const sql = 'UPDATE tbl_menus SET menu_name = ?, description = ?, price = ?, category = ?, image_url = ? WHERE menu_id = ?';
            const [result] = await db.query(sql, [menu_name, description, price, category, image_url, id]);
            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const sql = 'DELETE FROM tbl_menus WHERE menu_id = ?';
            const [result] = await db.query(sql, [id]);
            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Menu;