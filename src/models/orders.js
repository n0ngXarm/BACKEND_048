const db = require('../config/db');

class Order {
    // 1. ดึงข้อมูลออเดอร์ทั้งหมด (สำหรับ Admin Dashboard)
    static async findAll() {
        const sql = `
            SELECT 
                o.order_id,
                o.order_date,
                o.order_status,
                o.total_price,
                o.quantity,
                m.menu_name,
                c.fullname AS customer_name
            FROM tbl_orders o
            LEFT JOIN tbl_menus m ON o.menu_id = m.menu_id
            LEFT JOIN tbl_customers c ON o.customer_id = c.id
            ORDER BY o.order_id DESC
        `;
        
        try {
            const [rows] = await db.query(sql);
            return rows;
        } catch (error) {
            console.error("🔥 Error in findAll:", error);
            return []; // ถ้าพัง ให้ส่ง Array เปล่ากลับไปก่อน หน้าเว็บจะได้ไม่ขาว
        }
    }

    // 2. ดึงข้อมูลออเดอร์เดียว (เผื่อใช้ในอนาคต)
    static async findById(id) {
        const sql = `SELECT * FROM tbl_orders WHERE order_id = ?`;
        const [rows] = await db.query(sql, [id]);
        return rows[0];
    }

    // 3. สร้างออเดอร์ใหม่ (แก้จุดที่พังตรงนี้!)
    static async create(orderData) {
        // 🧹 คัดกรองข้อมูล: เอาเฉพาะ Field ที่ Database มีจริงๆ
        const cleanData = {
            customer_id: orderData.customer_id,
            menu_id: orderData.menu_id,
            quantity: orderData.quantity,
            total_price: orderData.total_price,
            order_status: 'Pending', // บังคับเป็น Pending เสมอ
            // ❌ ห้ามใส่ menu_name
            // ❌ ห้ามใส่ price (ราคาต่อหน่วย)
        };

        // ถ้า Database คุณต้องการ order_date แบบ Manual ให้เปิดบรรทัดนี้:
        // cleanData.order_date = new Date(); 

        const sql = 'INSERT INTO tbl_orders SET ?';
        const [result] = await db.query(sql, cleanData);
        return result.insertId;
    }

    // 4. อัปเดตสถานะ
    static async update(id, data) {
        const sql = 'UPDATE tbl_orders SET ? WHERE order_id = ?';
        const [result] = await db.query(sql, [data, id]);
        return result.affectedRows;
    }

    // 5. ลบออเดอร์
    static async delete(id) {
        const sql = 'DELETE FROM tbl_orders WHERE order_id = ?';
        const [result] = await db.query(sql, [id]);
        return result.affectedRows;
    }
}

module.exports = Order;