// index.js
require('dotenv').config();
const express = require('express');
const { swaggerUi, specs } = require("./swagger");

const app = express();
app.use(express.json());

// --- ลงทะเบียน Routes (แยกตามตาราง) ---
app.use("/api/users", require("./routes/users"));         // จัดการ tbl_users
app.use("/api/menus", require("./routes/menus"));         // จัดการ tbl_menus
app.use("/api/customers", require("./routes/customers")); // จัดการ tbl_customers
app.use("/api/orders", require("./routes/orders"));       // จัดการ tbl_orders

// --- Swagger Documentation ---
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));