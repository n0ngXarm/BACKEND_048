const db = require('../config/db');

class Order {
    static async findAll() {
        const sql = 'SELECT * FROM tbl_orders';
        const [rows] = await db.execute(sql);
        return rows;
    }

    static async create(orderData) {
        // สมมติว่ารับ user_id, total_price, status
        const { user_id, total_price, status } = orderData;
        const sql = 'INSERT INTO tbl_orders (user_id, total_price, status) VALUES (?, ?, ?)';
        const [result] = await db.execute(sql, [user_id, total_price, status || 'pending']);
        return result.insertId;
    }
}

module.exports = Order;