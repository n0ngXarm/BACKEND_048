const db = require('../config/db');

class Restaurant {
    static async findAll() {
        return db.query('SELECT * FROM tbl_restaurants').then(([rows]) => rows);
    }
    
    static async findById(id) {
        return db.query('SELECT * FROM tbl_restaurants WHERE restaurant_id = ?', [id]).then(([rows]) => rows[0]);
    }

    static async create(data) {
        const { restaurant_name, address, phone, menu_description } = data;
        const sql = 'INSERT INTO tbl_restaurants (restaurant_name, address, phone, menu_description) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(sql, [restaurant_name, address, phone, menu_description]);
        return result.insertId;
    }

    static async update(id, data) {
        const { restaurant_name, address, phone, menu_description } = data;
        const sql = 'UPDATE tbl_restaurants SET restaurant_name = ?, address = ?, phone = ?, menu_description = ? WHERE restaurant_id = ?';
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