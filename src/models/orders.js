const db = require('../config/db');

class Order {
    static async findAll() {
        const sql = 'SELECT o.order_id, o.customer_id, o.order_date, o.order_status, o.total_price, o.quantity, m.menu_name, c.fullname AS customer_name FROM tbl_orders o LEFT JOIN tbl_menus m ON o.menu_id = m.menu_id LEFT JOIN tbl_customers c ON o.customer_id = c.id ORDER BY o.order_id DESC';
        try {
            const [rows] = await db.query(sql);
            return rows;
        } catch (error) {
            return [];
        }
    }

    static async findById(id) {
        try {
            const sql = 'SELECT * FROM tbl_orders WHERE order_id = ?';
            const [rows] = await db.query(sql, [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async create(orderData) {
        try {
            // 1. ดึงราคาจากตารางเมนู (tbl_menus) เพื่อความถูกต้อง
            const [menu] = await db.query('SELECT price FROM tbl_menus WHERE menu_id = ?', [orderData.menu_id]);
            
            if (menu.length === 0) {
                throw new Error('Menu not found'); // ป้องกันกรณีรหัสเมนูผิด
            }

            const itemPrice = menu[0].price || 0;
            const calculatedTotal = itemPrice * orderData.quantity; // คำนวณราคารวมเอง

            const cleanData = {
                customer_id: orderData.customer_id,
                menu_id: orderData.menu_id,
                quantity: orderData.quantity,
                total_price: calculatedTotal, // ใช้ค่าที่คำนวณได้จาก Backend
                order_status: 'Pending'
            };
            const sql = 'INSERT INTO tbl_orders SET ?';
            const [result] = await db.query(sql, cleanData);
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, data) {
        try {
            const sql = 'UPDATE tbl_orders SET ? WHERE order_id = ?';
            const [result] = await db.query(sql, [data, id]);
            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const sql = 'DELETE FROM tbl_orders WHERE order_id = ?';
            const [result] = await db.query(sql, [id]);
            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Order;