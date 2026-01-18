const express = require('express');
const router = express.Router();
const controller = require('../controllers/restaurantController');
const multer = require('multer');
const path = require('path');

// ---------------------------------------------
// 1. ตั้งค่า Multer (เหมือนของเพื่อนพี่)
// ---------------------------------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // อย่าลืมสร้างโฟลเดอร์ uploads ที่ root project นะครับ
    },
    filename: (req, file, cb) => {
        // ตั้งชื่อไฟล์ใหม่กันซ้ำ: timestamp + random + นามสกุลเดิม
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

/**
 * @swagger
 * tags:
 *   - name: Restaurants
 *     description: Restaurant management
 */

/**
 * @swagger
 * /api/restaurants:
 *   get:
 *     summary: Get all restaurants
 *     tags: [Restaurants]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /api/restaurants/{id}:
 *   get:
 *     summary: Get restaurant by ID
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail
 *       404:
 *         description: Not found
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /api/restaurants:
 *   post:
 *     summary: Create restaurant (Support Image Upload)
 *     tags: [Restaurants]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               restaurant_name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               menu_description:
 *                 type: string
 *               image_url:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', upload.single('image_url'), async (req, res) => {
    try {
        // ถ้ามีไฟล์อัปโหลดมา ให้สร้าง URL แล้วยัดกลับไปใน body
        if (req.file) {
            // ⚠️ อย่าลืมเปลี่ยน http://localhost:3000 เป็น Domain จริงตอนขึ้น Server
            const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;
            req.body.image_url = baseUrl + req.file.filename;
        }
        // เรียก Controller ตามปกติ
        await controller.create(req, res);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/restaurants/{id}:
 *   put:
 *     summary: Update restaurant (Support Image Upload)
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               restaurant_name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               menu_description:
 *                 type: string
 *               image_url:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */
// ตรงบรรทัด router.put หรือ router.post
router.put('/:id', (req, res, next) => {
    console.log("📨 3. Route: มี Request เข้ามาที่ ID:", req.params.id);
    
    // เรียกใช้ Multer แบบดัก Error
    upload.single('image_url')(req, res, (err) => {
        if (err) {
            // 🔥 [จุดตาย] ถ้า Multer พัง มันจะร้องตรงนี้
            console.error("❌ 4. Multer Error:", err);
            return res.status(500).json({ error: "Upload Failed: " + err.message });
        }

        // 🔥 [จุดเช็คที่ 3] ดูว่า Multer แกะไฟล์ออกมาได้ไหม?
        if (req.file) {
            console.log("✅ 5. Backend: ได้รับไฟล์แล้ว! ->", req.file.filename);
        } else {
            console.log("⚠️ 5. Backend: ไม่เจอไฟล์แนบมา (req.file is empty)");
        }

        // ส่งไม้ต่อให้ Controller
        next();
    });
}, controller.update);
/**
 * @swagger
 * /api/restaurants/{id}:
 *   delete:
 *     summary: Delete restaurant
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', controller.delete);

module.exports = router;