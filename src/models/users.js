const db = require('../config/db');

class User {
    static async findByUsername(username) {
        try {
            const sql = 'SELECT * FROM tbl_customers WHERE username = ?';
            const [rows] = await db.query(sql, [username]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async create(userData) {
        try {
            const { firstname, fullname, lastname, phone, phone_number, email, gmail, username, password, address } = userData;
            const dbFullname = fullname || firstname;
            const dbPhone = phone_number || phone;
            const dbEmail = gmail || email;
            const dbStatus = 'active';
            const sql = 'INSERT INTO tbl_customers (fullname, lastname, phone_number, gmail, username, password, address, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            const [result] = await db.query(sql, [dbFullname, lastname, dbPhone, dbEmail, username, password, address, dbStatus]);
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;