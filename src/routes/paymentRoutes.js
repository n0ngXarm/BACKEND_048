const express = require('express');
const router = express.Router();
const controller = require('../controllers/paymentController');

/**
 * @swagger
 * tags:
 *   - name: Payments
 *     description: Payment management
 */

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all payments
 *     tags:
 *       - Payments
 *     responses:
 *       '200':
 *         description: Success
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags:
 *       - Payments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Detail
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Record new payment
 *     tags:
 *       - Payments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_id:
 *                 type: integer
 *               payment_method:
 *                 type: string
 *               payment_amount:
 *                 type: number
 *               payment_status:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Created
 */
router.post('/', controller.create);

/**
 * @swagger
 * /api/payments/{id}:
 *   put:
 *     summary: Update payment status
 *     tags:
 *       - Payments
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
 *               payment_status:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Updated
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /api/payments/{id}:
 *   delete:
 *     summary: Delete payment
 *     tags:
 *       - Payments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Deleted
 */
router.delete('/:id', controller.delete);

module.exports = router;