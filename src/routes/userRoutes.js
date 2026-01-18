const express = require('express');
const router = express.Router();

// Load controller (may export named or default). Provide safe fallbacks if missing.
let userController;
try {
	userController = require('../controllers/userController') || {};
} catch (e) {
	userController = {};
}

// Use named exports if available, otherwise try default export object
const getUsers = userController.getUsers || userController.default?.getUsers || ((req, res) => res.status(501).json({ error: 'getUsers not implemented' }));
const getUserById = userController.getUserById || userController.default?.getUserById || ((req, res) => res.status(501).json({ error: 'getUserById not implemented' }));
const createUser = userController.createUser || userController.default?.createUser || ((req, res) => res.status(501).json({ error: 'createUser not implemented' }));
const updateUser = userController.updateUser || userController.default?.updateUser || ((req, res) => res.status(501).json({ error: 'updateUser not implemented' }));
const deleteUser = userController.deleteUser || userController.default?.deleteUser || ((req, res) => res.status(501).json({ error: 'deleteUser not implemented' }));

// Load auth middleware safely (fallback to no-op middleware)
let verifyToken;
try {
	const authMod = require('../middleware/auth');
	if (typeof authMod === 'function') {
		verifyToken = authMod;
	} else if (authMod && typeof authMod.verifyToken === 'function') {
		verifyToken = authMod.verifyToken;
	} else {
		verifyToken = (req, res, next) => next();
	}
} catch (e) {
	verifyToken = (req, res, next) => next();
}

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User management API
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', verifyToken, getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User data
 *       404:
 *         description: User not found
 */
router.get('/:id', getUserById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/', createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags:
 *       - Users
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
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 */
router.put('/:id', updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete('/:id', deleteUser);

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - firstname
 *         - lastname
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the user
 *         username:
 *           type: string
 *           description: The username
 *         firstname:
 *           type: string
 *         lastname:
 *           type: string
 *         status:
 *           type: string
 *           enum:
 *             - active
 *             - inactive
 *       example:
 *         id: 1
 *         username: jdoe
 *         firstname: John
 *         lastname: Doe
 *         status: active
 */

module.exports = router;