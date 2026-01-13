const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

/**
 * @swagger
 * tags:
 *   - name: Menus
 *     description: Menu management
 */

/**
 * @swagger
 * /api/menus:
 *   get:
 *     summary: Get all menu items
 *     tags:
 *       - Menus
 *     responses:
 *       200:
 *         description: List of menu items
 */
router.get('/', menuController.getAllMenus);

/**
 * @swagger
 * /api/menus:
 *   post:
 *     summary: Create a new menu item
 *     tags:
 *       - Menus
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Menu item created
 */
router.post('/', menuController.createMenu);

module.exports = router;