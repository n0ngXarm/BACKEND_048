const db = require('../config/db');

class Customer {
    static async findAll() {
        const sql = 'SELECT * FROM tbl_customers';
        const [rows] = await db.query(sql);
        return rows;
    }

    static async findById(id) {
        const sql = 'SELECT * FROM tbl_customers WHERE id = ?';
        const [rows] = await db.query(sql, [id]);
        return rows[0];
    }

    static async create(data) {
        // รับค่ามาให้ครบทุกแบบ (เผื่อ Swagger ส่งมาต่างกัน)
        const { firstname, fullname, lastname, phone, phone_number, email, gmail, address, username, password } = data;
        
        // 🛠️ แปลงร่างตัวแปรให้ตรงกับ Database พี่
        const dbFullname = fullname || firstname; // ถ้าไม่มี fullname ให้เอา firstname มาใส่แทน
        const dbPhone = phone_number || phone;
        const dbEmail = gmail || email;

        // ⚠️ SQL ตัวจริง: ต้องใช้ชื่อ Column ตาม Database เป๊ะๆ!
        // (fullname, lastname, phone_number, gmail, address, username, password)
        const sql = `INSERT INTO tbl_customers 
                     (fullname, lastname, phone_number, gmail, address, username, password) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
        const [result] = await db.query(sql, [
            dbFullname, 
            lastname, 
            dbPhone, 
            dbEmail, 
            address, 
            username, 
            password
        ]);
        return result.insertId;
    }

    static async update(id, data) {
        const { firstname, fullname, lastname, phone, phone_number, email, gmail, address } = data;
        
        const dbFullname = fullname || firstname;
        const dbPhone = phone_number || phone;
        const dbEmail = gmail || email;

        const sql = `UPDATE tbl_customers 
                     SET fullname = ?, lastname = ?, phone_number = ?, gmail = ?, address = ? 
                     WHERE id = ?`;
                     
        const [result] = await db.query(sql, [dbFullname, lastname, dbPhone, dbEmail, address, id]);
        return result.affectedRows;
    }

    static async delete(id) {
        const sql = 'DELETE FROM tbl_customers WHERE id = ?';
        const [result] = await db.query(sql, [id]);
        return result.affectedRows;
    }
}

module.exports = Customer;