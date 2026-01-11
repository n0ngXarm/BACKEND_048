const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: User authentication (Register & Login)
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new customer
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - fullname
 *             properties:
 *               fullname:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', (req, res) => {
  res.status(201).json({ message: 'User registered successfully (placeholder)' });
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login to get Access Token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', (req, res) => {
  res.json({ message: 'Login successful (placeholder)', accessToken: 'dummy' });
});

module.exports = router;
