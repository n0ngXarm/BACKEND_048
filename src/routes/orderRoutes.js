const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// --- เช็คความปลอดภัย (จะได้รู้ถ้า controller โหลดไม่ติด) ---
if (!orderController || !orderController.createOrder) {
    console.error("❌ CRITICAL ERROR: โหลด Controller ไม่สำเร็จ! เช็คไฟล์ orderController.js ด่วน");
}

/**
 * @swagger
 * tags:
 * - name: Orders
 * description: Order management
 */

// ✅ 1. ดูออเดอร์ทั้งหมด (GET /api/orders)
/**
 * @swagger
 * /api/orders:
 * get:
 * summary: Get all orders
 * tags: [Orders]
 * responses:
 * 200:
 * description: List of orders
 */
router.get('/', orderController.getAllOrders);


// ✅ 2. สั่งอาหาร (POST /api/orders)
/**
 * @swagger
 * /api/orders:
 * post:
 * summary: Create new order
 * tags: [Orders]
 * responses:
 * 201:
 * description: Order created
 */
router.post('/', orderController.createOrder);


// ✅ 3. อัปเดตสถานะ (PUT /api/orders/:id)
/**
 * @swagger
 * /api/orders/{id}:
 * put:
 * summary: Update order status
 * tags: [Orders]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * requestBody:
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * order_status:
 * type: string
 * responses:
 * 200:
 * description: Order updated successfully
 */
// ⚠️ แก้ชื่อให้ตรงกับ Controller (จาก updateOrder เป็น updateOrderStatus)
router.put('/:id', orderController.updateOrderStatus);


module.exports = router;