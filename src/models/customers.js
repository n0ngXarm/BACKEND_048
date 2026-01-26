const db = require('../config/db');

class Customer {
    static async findAll() {
        try {
            const sql = 'SELECT id, fullname, lastname, phone_number, gmail, address, username, password, status, created_at, updated_at FROM tbl_customers';
            const [rows] = await db.query(sql);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const sql = 'SELECT id, fullname, lastname, phone_number, gmail, address, username, password, status, created_at, updated_at FROM tbl_customers WHERE id = ?';
            const [rows] = await db.query(sql, [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async create(data) {
        try {
            const { firstname, fullname, lastname, phone, phone_number, email, gmail, address, username, password } = data;
            const dbFullname = fullname || firstname;
            const dbPhone = phone_number || phone;
            const dbEmail = gmail || email;
            const sql = 'INSERT INTO tbl_customers (fullname, lastname, phone_number, gmail, address, username, password) VALUES (?, ?, ?, ?, ?, ?, ?)';
            const [result] = await db.query(sql, [dbFullname, lastname, dbPhone, dbEmail, address, username, password]);
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, data) {
        try {
            const { firstname, fullname, lastname, phone, phone_number, email, gmail, address, password } = data;
            const dbFullname = fullname || firstname;
            const dbPhone = phone_number || phone;
            const dbEmail = gmail || email;
            
            let sql = 'UPDATE tbl_customers SET fullname = ?, lastname = ?, phone_number = ?, gmail = ?, address = ?';
            const params = [dbFullname, lastname, dbPhone, dbEmail, address];

            if (password) {
                sql += ', password = ?';
                params.push(password);
            }

            sql += ' WHERE id = ?';
            params.push(id);

            const [result] = await db.query(sql, params);
            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const sql = 'DELETE FROM tbl_customers WHERE id = ?';
            const [result] = await db.query(sql, [id]);
            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Customer;