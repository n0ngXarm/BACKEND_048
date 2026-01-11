const db = require('../config/db');

class Customer {
    // หา user จาก username (ใช้ตอน Login)
    static async findByUsername(username) {
        const [rows] = await db.query('SELECT * FROM tbl_customers WHERE username = ?', [username]);
        return rows[0];
    }

    // สร้าง user ใหม่ (ใช้ตอน Register)
    static async create(userData) {
        const { fullname, username, password, email, phone_number, address } = userData;
        const [result] = await db.query(
            'INSERT INTO tbl_customers (fullname, username, password, gmail, phone_number, address) VALUES (?, ?, ?, ?, ?, ?)',
            [fullname, username, password, email, phone_number, address]
        );
        return result.insertId;
    }
}

module.exports = Customer;