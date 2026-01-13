const db = require('../config/db');

class Payment {
    static async findAll() {
        return db.query('SELECT * FROM tbl_payments').then(([rows]) => rows);
    }

    static async findById(id) {
        return db.query('SELECT * FROM tbl_payments WHERE payment_id = ?', [id]).then(([rows]) => rows[0]);
    }

    static async create(data) {
        const { order_id, payment_method, payment_amount, payment_status } = data;
        const sql = 'INSERT INTO tbl_payments (order_id, payment_method, payment_amount, payment_status, payment_date) VALUES (?, ?, ?, ?, NOW())';
        const [result] = await db.query(sql, [order_id, payment_method, payment_amount, payment_status || 'Pending']);
        return result.insertId;
    }

    static async update(id, data) {
        // ปกติแก้แค่สถานะ (เช่น จาก Pending -> Completed)
        const { payment_status } = data;
        const sql = 'UPDATE tbl_payments SET payment_status = ? WHERE payment_id = ?';
        const [result] = await db.query(sql, [payment_status, id]);
        return result.affectedRows;
    }

    static async delete(id) {
        const sql = 'DELETE FROM tbl_payments WHERE payment_id = ?';
        const [result] = await db.query(sql, [id]);
        return result.affectedRows;
    }
}
module.exports = Payment;