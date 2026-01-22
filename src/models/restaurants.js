const db = require('../config/db');

class Restaurant {
    static async findAll() {
        try {
            const sql = 'SELECT restaurant_id, restaurant_name, address, phone, menu_description, image_url FROM tbl_restaurants';
            const [rows] = await db.query(sql);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const sql = 'SELECT * FROM tbl_restaurants WHERE restaurant_id = ?';
            const [rows] = await db.query(sql, [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async create(data) {
        try {
            const { restaurant_name, address, phone, menu_description, image_url } = data;
            const sql = 'INSERT INTO tbl_restaurants (restaurant_name, address, phone, menu_description, image_url) VALUES (?, ?, ?, ?, ?)';
            const [result] = await db.query(sql, [restaurant_name, address, phone, menu_description, image_url]);
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

static async update(id, data) {
        try {
            const { restaurant_name, address, phone, menu_description } = data;
            const sql = 'UPDATE tbl_restaurants SET restaurant_name = ?, address = ?, phone = ?, menu_description = ? WHERE restaurant_id = ?';
            const [result] = await db.query(sql, [restaurant_name, address, phone, menu_description, id]);
            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const sql = 'DELETE FROM tbl_restaurants WHERE restaurant_id = ?';
            const [result] = await db.query(sql, [id]);
            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Restaurant;