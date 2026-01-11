const db = require('../config/db');

class Menu {
    // ดึงเมนูทั้งหมดของร้านอาหารร้านหนึ่ง
    static async findByRestaurantId(restaurantId) {
        const [rows] = await db.query('SELECT * FROM tbl_menus WHERE restaurant_id = ?', [restaurantId]);
        return rows;
    }

    // เพิ่มเมนูอาหารใหม่
    static async create(data) {
        const { restaurant_id, menu_name, description, price, category } = data;
        const [result] = await db.query(
            'INSERT INTO tbl_menus (restaurant_id, menu_name, description, price, category) VALUES (?, ?, ?, ?, ?)',
            [restaurant_id, menu_name, description, price, category]
        );
        return result.insertId;
    }
}

module.exports = Menu;