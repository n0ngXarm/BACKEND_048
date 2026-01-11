const db = require('../config/db');

class Restaurant {
    // ดึงข้อมูลร้านทั้งหมด
    static async findAll() {
        const [rows] = await db.query('SELECT * FROM tbl_restaurants');
        return rows;
    }

    // ดึงข้อมูลร้านตาม ID
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM tbl_restaurants WHERE restaurant_id = ?', [id]);
        return rows[0];
    }

    // เพิ่มร้านอาหารใหม่ (สำหรับ Admin)
    static async create(data) {
        const { restaurant_name, address, phone, menu_description } = data;
        const [result] = await db.query(
            'INSERT INTO tbl_restaurants (restaurant_name, address, phone, menu_description) VALUES (?, ?, ?, ?)',
            [restaurant_name, address, phone, menu_description]
        );
        return result.insertId;
    }
}

module.exports = Restaurant;