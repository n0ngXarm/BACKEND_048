const app = require('./src/app');
const dotenv = require('dotenv');

dotenv.config();

// Load userController from src with safe fallbacks
let userController;
try {
	userController = require('./src/controllers/userController') || {};
} catch (e) {
	userController = {};
}
const getProfile = userController.getProfile || userController.default?.getProfile || ((req, res) => res.status(501).json({ error: 'getProfile not implemented' }));
const updateProfile = userController.updateProfile || userController.default?.updateProfile || ((req, res) => res.status(501).json({ error: 'updateProfile not implemented' }));

// Register endpoints (use guaranteed functions)
app.get('/api/users/:id', getProfile);
app.put('/api/users/update', updateProfile);

// Auth Routes (Login & Refresh Token)
const authController = require('./src/controllers/authController');
app.post('/login', authController.login);
app.post('/auth/refresh', authController.refreshToken);

// Start Cron Job (Scheduler)
// ตรวจสอบให้แน่ใจว่าติดตั้งแล้ว: npm install node-cron
const scheduler = require('./scheduler');

// If scheduler exports a function to initialize jobs, call it here:
if (typeof scheduler === 'function') {
    scheduler();
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
});