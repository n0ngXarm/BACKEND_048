// routes/menus.js
const express = require("express");
const router = express.Router();
const db = require("../config/db"); // เรียกใช้ database connection

// ----------------------------------------------------
// 1. GET ALL MENUS (ดูเมนูทั้งหมด)
// ----------------------------------------------------
/**
 * @openapi
 * /api/menus:
 *   get:
 *     tags:
 *       - Menus
 *     summary: ดึงข้อมูลเมนูอาหารทั้งหมด
 *     responses:
 *       200:
 *         description: สำเร็จ
 */
router.get('/', async (req, res) => {
    try {
        // ใช้ชื่อตารางตาม server อาจารย์: tbl_menus
        const [rows] = await db.query('SELECT * FROM tbl_menus');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// ----------------------------------------------------
// 2. GET MENU BY ID (ดูเมนูตามรหัส)
// ----------------------------------------------------
/**
 * @openapi
 * /api/menus/{id}:
 *   get:
 *     tags:
 *       - Menus
 *     summary: ดูเมนูตาม ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: พบข้อมูล
 *       404:
 *         description: ไม่พบข้อมูล
 */
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM tbl_menus WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Menu not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// ----------------------------------------------------
// 3. POST (เพิ่มเมนูใหม่)
// ----------------------------------------------------
/**
 * @openapi
 * /api/menus:
 *   post:
 *     tags:
 *       - Menus
 *     summary: เพิ่มเมนูอาหาร
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               menu_name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: เพิ่มสำเร็จ
 */
router.post('/', async (req, res) => {
    // สมมติฟิลด์ตามมาตรฐาน (ต้องเช็คชื่อคอลัมน์จริงใน DB อาจารย์อีกทีนะครับ)
    const { menu_name, price, category, image_url } = req.body; 
    try {
        const sql = 'INSERT INTO tbl_menus (menu_name, price, category, image_url) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(sql, [menu_name, price, category, image_url]);
        res.json({ id: result.insertId, message: 'Menu added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Insert failed' });
    }
});

module.exports = router;