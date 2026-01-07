const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Order management
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     tags:
 *       - Orders
 *     responses:
 *       '200':
 *         description: List of orders
 */
router.get('/', orderController.getAllOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Order details
 *       '404':
 *         description: Order not found
 */
router.get('/:id', orderController.getOrderById);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create new order
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               total_price:
 *                 type: number
 *               status:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Order created
 */
router.post('/', orderController.createOrder);

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Update order status
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: completed
 *     responses:
 *       '200':
 *         description: Order updated successfully
 */
router.put('/:id', orderController.updateOrder);

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete order
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Order deleted successfully
 */
router.delete('/:id', orderController.deleteOrder);

module.exports = router;