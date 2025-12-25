const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ----------------------------------------------------
// 1. GET ALL CUSTOMERS (ดึงข้อมูลลูกค้าทั้งหมด)
// ----------------------------------------------------
/**
 * @openapi
 * /api/customers:
 *   get:
 *     tags:
 *       - Customers
 *     summary: ดึงข้อมูลลูกค้าทั้งหมด
 *     responses:
 *       200:
 *         description: สำเร็จ
 */
router.get('/', async (req, res) => {
    try {
        // เลือกมาเฉพาะข้อมูลที่จำเป็น ไม่ต้องเอา password มาโชว์
        const sql = 'SELECT id, fullname, lastname, address, phone_number, gmail, status FROM tbl_customers';
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// ----------------------------------------------------
// 2. GET CUSTOMER BY ID (ดูตามรหัส)
// ----------------------------------------------------
/**
 * @openapi
 * /api/customers/{id}:
 *   get:
 *     tags:
 *       - Customers
 *     summary: ดูข้อมูลลูกค้าตาม ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ไอดีของลูกค้า
 *     responses:
 *       200:
 *         description: พบข้อมูล
 *       404:
 *         description: ไม่พบลูกค้า
 */
router.get('/:id', async (req, res) => {
    try {
        const sql = 'SELECT id, fullname, lastname, address, phone_number, gmail, status FROM tbl_customers WHERE id = ?';
        const [rows] = await db.query(sql, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// ----------------------------------------------------
// 3. POST (เพิ่มลูกค้าใหม่)
// ----------------------------------------------------
/**
 * @openapi
 * /api/customers:
 *   post:
 *     tags:
 *       - Customers
 *     summary: เพิ่มลูกค้าใหม่
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               address:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               gmail:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: เพิ่มสำเร็จ
 */
router.post('/', async (req, res) => {
    // รับค่าให้ตรงกับชื่อคอลัมน์ใน DB
    const { fullname, lastname, address, phone_number, gmail, username, password, status } = req.body;

    try {
        // (จริงๆ ควร Hash password ด้วย bcrypt ก่อนบันทึกนะครับ)
        const sql = `INSERT INTO tbl_customers 
                     (fullname, lastname, address, phone_number, gmail, username, password, status, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
                     
        const [result] = await db.query(sql, [
            fullname, lastname, address, phone_number, gmail, username, password, status || 'active'
        ]);

        res.json({ id: result.insertId, message: 'Customer added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Insert failed' });
    }
});

module.exports = router;