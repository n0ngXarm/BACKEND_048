const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes (นำเข้าเส้นทาง)
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const menuRoutes = require('./routes/menuRoutes');      // ✅ เพิ่ม
const orderRoutes = require('./routes/orderRoutes');    // ✅ เพิ่ม
const customerRoutes = require('./routes/customerRoutes'); // ✅ เพิ่ม
const restaurantRoutes = require('./routes/restaurantRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Use Routes (เปิดใช้งาน)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/menus', menuRoutes);       // ✅ เปิดใช้งาน /api/menus
app.use('/api/orders', orderRoutes);     // ✅ เปิดใช้งาน /api/orders
app.use('/api/customers', customerRoutes); // ✅ เปิดใช้งาน /api/customers
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/payments', paymentRoutes);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Default Route
app.get('/', (req, res) => {
    res.send('API Backend is running! Access docs at <a href="/api-docs">/api-docs</a>');
});

module.exports = app;