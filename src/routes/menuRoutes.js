const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
// const { verifyToken, isAdmin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Menus
 *   description: Menu management
 */

/**
 * @swagger
 * /menus/restaurant/{restaurantId}:
 *   get:
 *     summary: Get all menus of a specific restaurant
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the restaurant
 *     responses:
 *       200:
 *         description: List of menus
 */
router.get('/restaurant/:restaurantId', menuController.getMenusByRestaurant);

/**
 * @swagger
 * /api/menus:
 *   post:
 *     summary: Create a new menu (Admin only)
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurant_id
 *               - menu_name
 *               - price
 *             properties:
 *               restaurant_id:
 *                 type: integer
 *               menu_name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Menu created successfully
 */
router.post('/', menuController.createMenu);
// router.post('/', verifyToken, isAdmin, menuController.createMenu);

module.exports = router;
