// src/models/customers.js
const db = require('../config/db');

class Customer {
    static async findAll() {
        // เปลี่ยน execute -> query เพื่อความชัวร์
        const sql = 'SELECT * FROM tbl_customers';
        const [rows] = await db.query(sql); 
        return rows;
    }

    static async create(data) {
        // ⚠️ แก้ตรงนี้ให้ตรงกับ Database ของพี่ (email -> gmail)
        const { firstname, lastname, phone, email, gmail } = data;
        
        // ใช้ค่าจาก email หรือ gmail ก็ได้ (เผื่อ Swagger ส่งมาเป็น email)
        const userEmail = gmail || email; 

        // เปลี่ยน execute -> query และแก้ชื่อ column ใน SQL
        const sql = 'INSERT INTO tbl_customers (firstname, lastname, phone_number, gmail) VALUES (?, ?, ?, ?)';
        
        // ⚠️ เช็คชื่อ column ให้ตรง DB จริงๆ (phone -> phone_number ตามรูป screenshot)
        const [result] = await db.query(sql, [firstname, lastname, phone, userEmail]);
        return result.insertId;
    }
}
module.exports = Customer;