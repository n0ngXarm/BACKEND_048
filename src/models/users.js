// src/models/users.js
const db = require('../config/db');

class User {
    static async findByUsername(username) {
        // ตรวจสอบชื่อตาราง 'accounts' ว่าตรงกับใน Database (ในรูปที่ 1 พี่มีตาราง accounts ถูกแล้ว)
        const sql = 'SELECT * FROM accounts WHERE username = ?'; 
        const [rows] = await db.execute(sql, [username]);
        return rows[0];
    }

    static async create(userData) {
        const { username, password, gmail, role } = userData;
        // ตรวจสอบชื่อ column ให้ตรงกับใน Database จริงๆ
        const sql = 'INSERT INTO accounts (username, password, gmail, role) VALUES (?, ?, ?, ?)';
        const [result] = await db.execute(sql, [username, password, gmail, role || 'user']);
        return result.insertId;
    }
}

module.exports = User;