const db = require('../config/db');

class Payment {
    static async findAll() {
        try {
            const [rows] = await db.query('SELECT * FROM tbl_payments');
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM tbl_payments WHERE payment_id = ?', [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async create(data) {
        try {
            const { order_id, payment_method, payment_amount, payment_status } = data;
            const sql = 'INSERT INTO tbl_payments (order_id, payment_method, payment_amount, payment_status, payment_date) VALUES (?, ?, ?, ?, NOW())';
            const [result] = await db.query(sql, [order_id, payment_method, payment_amount, payment_status || 'Pending']);
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, data) {
        try {
            const { payment_status } = data;
            const sql = 'UPDATE tbl_payments SET payment_status = ? WHERE payment_id = ?';
            const [result] = await db.query(sql, [payment_status, id]);
            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const sql = 'DELETE FROM tbl_payments WHERE payment_id = ?';
            const [result] = await db.query(sql, [id]);
            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = Payment;