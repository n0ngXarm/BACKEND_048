const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ----------------------------------------------------
// 1. GET ALL ORDERS
// ----------------------------------------------------
/**
 * @openapi
 * /api/orders:
 *   get:
 *     tags:
 *       - Orders
 *     summary: ดึงข้อมูลรายการสั่งซื้อทั้งหมด
 *     responses:
 *       200:
 *         description: สำเร็จ
 */
router.get('/', async (req, res) => {
    try {
        const sql = 'SELECT * FROM tbl_orders ORDER BY order_id DESC';
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// ----------------------------------------------------
// 2. GET ORDER BY ID
// ----------------------------------------------------
/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     tags:
 *       - Orders
 *     summary: ดูรายละเอียดคำสั่งซื้อตาม ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ไอดีของออเดอร์
 *     responses:
 *       200:
 *         description: พบข้อมูล
 *       404:
 *         description: ไม่พบออเดอร์
 */
router.get('/:id', async (req, res) => {
    try {
        // แก้ WHERE id เป็น WHERE order_id
        const sql = 'SELECT * FROM tbl_orders WHERE order_id = ?';
        const [rows] = await db.query(sql, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Order not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// ----------------------------------------------------
// 3. POST (สร้างออเดอร์ใหม่)
// ----------------------------------------------------
/**
 * @openapi
 * /api/orders:
 *   post:
 *     tags:
 *       - Orders
 *     summary: สร้างคำสั่งซื้อใหม่
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer_id:
 *                 type: integer
 *               restaurant_id:
 *                 type: integer
 *               menu_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               total_price:
 *                 type: number
 *               order_status:
 *                 type: string
 *     responses:
 *       200:
 *         description: สร้างรายการสำเร็จ
 */
router.post('/', async (req, res) => {
    const { customer_id, restaurant_id, menu_id, quantity, total_price, order_status } = req.body;

    try {
        // ไม่ต้องใส่ order_date เพราะ Database ทำให้เอง (CURRENT_TIMESTAMP)
        // ถ้าไม่ส่ง order_status มา จะใช้ค่า Default เป็น 'Processing'
        const sql = `INSERT INTO tbl_orders 
                     (customer_id, restaurant_id, menu_id, quantity, total_price, order_status) 
                     VALUES (?, ?, ?, ?, ?, ?)`;
        
        const [result] = await db.query(sql, [
            customer_id, 
            restaurant_id, 
            menu_id, 
            quantity, 
            total_price, 
            order_status || 'Processing' // ถ้าไม่ส่งมาให้เป็น Processing
        ]);

        res.json({ 
            id: result.insertId, 
            message: 'Order created successfully' 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Insert failed' });
    }
});

// ----------------------------------------------------
// 4. PUT (อัปเดตสถานะ)
// ----------------------------------------------------
/**
 * @openapi
 * /api/orders/{id}:
 *   put:
 *     tags:
 *       - Orders
 *     summary: อัปเดตสถานะคำสั่งซื้อ
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ไอดีของออเดอร์
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_status:
 *                 type: string
 *                 example: completed
 *     responses:
 *       200:
 *         description: อัปเดตสำเร็จ
 */
router.put('/:id', async (req, res) => {
    const { order_status } = req.body;
    try {
        // แก้ WHERE id เป็น WHERE order_id
        const sql = 'UPDATE tbl_orders SET order_status = ? WHERE order_id = ?';
        const [result] = await db.query(sql, [order_status, req.params.id]);

        if (result.affectedRows === 0) return res.status(404).json({ message: 'Order not found' });

        res.json({ message: 'Order status updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Update failed' });
    }
});

// ----------------------------------------------------
// 5. DELETE ORDER
// ----------------------------------------------------
/**
 * @openapi
 * /api/orders/{id}:
 *   delete:
 *     tags:
 *       - Orders
 *     summary: ลบคำสั่งซื้อ
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ไอดีของออเดอร์
 *     responses:
 *       200:
 *         description: ลบสำเร็จ
 */
router.delete('/:id', async (req, res) => {
    try {
        // แก้ WHERE id เป็น WHERE order_id
        const sql = 'DELETE FROM tbl_orders WHERE order_id = ?';
        const [result] = await db.query(sql, [req.params.id]);
        
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Delete failed' });
    }
});

module.exports = router;