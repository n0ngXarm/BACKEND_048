const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger'); // Import Swagger Config

const app = express();

// Middleware
app.use(cors()); // ✅ 1. CORS ตามโจทย์
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
// const menuRoutes = require('./routes/menus'); // (ถ้ามี)

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // ✅ 2. User Routes

// ✅ 3. Setup Swagger UI ที่ /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Default Route
app.get('/', (req, res) => {
    res.send('API Backend is running! Access docs at <a href="/api-docs">/api-docs</a>');
});

module.exports = app;