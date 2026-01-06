const db = require('../config/db');

class User {
    static async findAll() {
        // ⚠️ เช็คชื่อตารางใน DB ดีๆ นะครับ ในรูปโจทย์ใช้ 'tbl_users' แต่ใน DB คุณมี 'accounts'
        // ผมจะใช้ 'tbl_users' ตามโจทย์อาจารย์นะครับ
        const sql = 'SELECT id, firstname, fullname, lastname, username, status FROM tbl_users';
        const [rows] = await db.execute(sql);
        return rows;
    }

    static async findById(id) {
        const sql = 'SELECT id, firstname, fullname, lastname, username, status FROM tbl_users WHERE id = ?';
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    }

    static async findByUsername(username) {
        const sql = 'SELECT * FROM tbl_users WHERE username = ?';
        const [rows] = await db.execute(sql, [username]);
        return rows[0];
    }

    static async create(userData) {
        const { firstname, fullname, lastname, username, password, status } = userData;
        const sql = 'INSERT INTO tbl_users (firstname, fullname, lastname, username, password, status) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await db.execute(sql, [firstname, fullname, lastname, username, password, status]);
        return result.insertId;
    }

    static async update(id, userData) {
        const { firstname, fullname, lastname, password } = userData;
        let sql = 'UPDATE tbl_users SET firstname = ?, fullname = ?, lastname = ?';
        const params = [firstname, fullname, lastname];

        if (password) {
            sql += ', password = ?';
            params.push(password);
        }

        sql += ' WHERE id = ?';
        params.push(id);

        const [result] = await db.execute(sql, params);
        return result.affectedRows;
    }

    static async delete(id) {
        const sql = 'DELETE FROM tbl_users WHERE id = ?';
        const [result] = await db.execute(sql, [id]);
        return result.affectedRows;
    }
}

module.exports = User;