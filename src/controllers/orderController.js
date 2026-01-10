// ⚠️ เช็คบรรทัดนี้ด้วยนะว่าไฟล์พี่ชื่อ db.js หรือ database.js
const db = require('../config/db'); 

// ✅ 1. สั่งอาหาร (Create Order)
exports.createOrder = async (req, res) => {
    try {
        console.log("📦 ได้รับคำสั่งซื้อ:", req.body); // ดู Log ว่า Frontend ส่งอะไรมา

        const { customer_id, restaurant_id, total_price, status } = req.body;

        // เช็คข้อมูลก่อนยิงลง DB
        if (!customer_id || !restaurant_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'ข้อมูลไม่ครบ (ขาด customer_id หรือ restaurant_id)' 
            });
        }

        // เตรียม SQL (ต้องตรงกับตาราง tbl_orders ของพี่)
        const sql = `
            INSERT INTO tbl_orders 
            (customer_id, restaurant_id, total_price, order_status, order_date) 
            VALUES (?, ?, ?, ?, NOW())
        `;

        // เตรียมค่าที่จะใส่ (กันค่าว่าง)
        const values = [
            customer_id,
            restaurant_id,
            parseFloat(total_price) || 0,
            status || 'Pending'
        ];

        // ยิงลง Database
        const [result] = await db.execute(sql, values);

        console.log("✅ บันทึกสำเร็จ! Order ID:", result.insertId);

        res.json({ 
            success: true, 
            message: 'สั่งซื้อสำเร็จ! (Saved to DB)', 
            order_id: result.insertId 
        });

    } catch (err) {
        console.error("❌ SQL Error:", err.sqlMessage || err.message);
        res.status(500).json({ 
            success: false, 
            message: 'Database Error', 
            error_detail: err.sqlMessage || err.message 
        });
    }
};

// ✅ 2. ดึงออเดอร์ทั้งหมด (Get All Orders - สำหรับหน้า Admin)
exports.getAllOrders = async (req, res) => {
    try {
        // JOIN ตารางลูกค้า (tbl_customers) เพื่อให้เห็นชื่อคนสั่ง
        const sql = `
            SELECT o.*, c.fullname, c.username 
            FROM tbl_orders o
            LEFT JOIN tbl_customers c ON o.customer_id = c.id
            ORDER BY o.order_date DESC
        `;
        const [rows] = await db.execute(sql);
        res.json(rows);
    } catch (err) {
        console.error("Get Orders Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// ✅ 3. อัปเดตสถานะ (Update Status - สำหรับปุ่มจบงาน)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { order_status } = req.body;
        const { id } = req.params; // รับ id จาก URL

        const sql = "UPDATE tbl_orders SET order_status = ? WHERE order_id = ?";
        const [result] = await db.execute(sql, [order_status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, message: 'Updated status successfully' });
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ error: err.message });
    }
};