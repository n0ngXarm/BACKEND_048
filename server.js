const cors = require('cors');
const app = require('./src/app');
const dotenv = require('dotenv');

dotenv.config();

// Configure CORS before registering routes
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
});