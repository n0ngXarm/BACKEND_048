// src/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger'); // เรียก config/swagger.js
const { errorHandler } = require('./middleware/errorMiddleware');

// Import Routes (เดี๋ยวเราค่อยไปใส่โค้ดในไฟล์ routes ทีหลัง)
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const menuRoutes = require('./routes/menuRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Swagger Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menus', menuRoutes);

// Test Route
app.get('/', (req, res) => {
    res.send('Food Delivery API is running (Pro Version)...');
});

// Error Middleware (ต้องอยู่ล่างสุด)
app.use(errorHandler);

module.exports = app;