const db = require('../config/db');

class User {
    // ใช้ tbl_customers แทน accounts
    static async findByUsername(username) {
        const sql = 'SELECT * FROM tbl_customers WHERE username = ?';
        const [rows] = await db.query(sql, [username]);
        return rows[0];
    }

    static async create(userData) {
        // รับค่าให้ครบตามตาราง tbl_customers
        const { 
            firstname, fullname, lastname, 
            phone, phone_number, 
            email, gmail, 
            username, password, address 
        } = userData;
        
        // Map ค่าให้ตรงกับชื่อ Column ใน Database เป๊ะๆ
        const dbFullname = fullname || firstname;
        const dbPhone = phone_number || phone;
        const dbEmail = gmail || email;
        const dbStatus = 'active'; // Default status

        const sql = `
            INSERT INTO tbl_customers 
            (fullname, lastname, phone_number, gmail, username, password, address, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.query(sql, [
            dbFullname, lastname, dbPhone, dbEmail, username, password, address, dbStatus
        ]);
        return result.insertId;
    }
}

module.exports = User;