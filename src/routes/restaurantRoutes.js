const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
// const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Restaurants
 *   description: Restaurant management
 */

/**
 * @swagger
 * /api/restaurants:
 *   get:
 *     summary: Get all restaurants
 *     tags: [Restaurants]
 *     responses:
 *       200:
 *         description: List of all restaurants
 */
router.get('/', restaurantController.getAllRestaurants);

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
 *         description: Restaurant details
 *       404:
 *         description: Restaurant not found
 */
router.get('/:id', restaurantController.getRestaurantById);

/**
 * @swagger
 * /api/restaurants:
 *   post:
 *     summary: Create a new restaurant (Admin only)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurant_name
 *               - address
 *             properties:
 *               restaurant_name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               menu_description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Restaurant created
 */
router.post('/', restaurantController.createRestaurant);
// router.post('/', verifyToken, restaurantController.createRestaurant);

module.exports = router;
