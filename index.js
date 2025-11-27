require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs'); 
const cors = require('cors');
const jwt = require('jsonwebtoken');
const verifyToken = require('./middleware/auth'); 

const app = express();

app.use(cors());
app.use(express.json());

// เชื่อมต่อฐานข้อมูล
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});
const SECRET_KEY = process.env.JWT_SECRET;

// =====================
// 2.1 Register
// =====================
app.post('/auth/register', async (req, res) => {
  const { username, password, fullname } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing info' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    // ตาราง tbl_customers ตรงกับโค้ดเดิม (มี id, username, password, fullname)
    await pool.query(
      'INSERT INTO tbl_customers (username, password, fullname) VALUES (?, ?, ?)',
      [username, hashedPassword, fullname]
    );
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// 2.2 Login
// =====================
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM tbl_customers WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ message: 'User not found' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // ในรูป tbl_customers ใช้ 'id' เป็น PK (ถูกต้องตามโค้ดเดิม)
    const token = jwt.sign({ id: user.id, fullname: user.fullname }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// 2.4 Get Customers
// =====================
app.get('/customers', verifyToken, async (req, res) => {
  try {
    // ดึงข้อมูลลูกค้า (ในรูปมี id, username, fullname, created_at)
    const [rows] = await pool.query('SELECT id, username, fullname, created_at FROM tbl_customers');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// 2.5 Get Menus (แก้ไข SQL ให้ตรง Schema)
// =====================
app.get('/menus', async (req, res) => {
  try {
    // แก้ไข: ใช้ menu_id, menu_name, restaurant_name, restaurant_id ให้ตรง DB
    // แต่ alias (as) กลับเป็นชื่อเดิม เพื่อให้ Frontend หรือ Postman อ่านง่าย
    const sql = `
      SELECT 
        m.menu_id AS id, 
        m.menu_name AS name, 
        m.price, 
        r.restaurant_name AS restaurant_name 
      FROM tbl_menus m
      JOIN tbl_restaurants r ON m.restaurant_id = r.restaurant_id
    `;
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// 2.6 Place Order (แก้ไข SQL ให้ตรง Schema)
// =====================
app.post('/orders', verifyToken, async (req, res) => {
  const { restaurant_id, menu_id, quantity } = req.body;
  const customer_id = req.user.id; 

  try {
    // แก้ไข: WHERE id เป็น WHERE menu_id
    const [menus] = await pool.query('SELECT price FROM tbl_menus WHERE menu_id = ?', [menu_id]);
    if (menus.length === 0) return res.status(404).json({ message: 'Menu not found' });

    const total_price = menus[0].price * quantity;

    // Insert ลง tbl_orders (column ตรงกับรูปภาพ: customer_id, restaurant_id, menu_id, quantity, total_price)
    const [result] = await pool.query(
      'INSERT INTO tbl_orders (customer_id, restaurant_id, menu_id, quantity, total_price) VALUES (?, ?, ?, ?, ?)',
      [customer_id, restaurant_id, menu_id, quantity, total_price]
    );

    res.status(201).json({ 
        message: 'Order placed', 
        order_id: result.insertId, 
        total_price 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// 2.7 Order Summary
// =====================
app.get('/orders/summary', verifyToken, async (req, res) => {
  const customer_id = req.user.id;
  try {
    // tbl_customers ใช้ id, tbl_orders ใช้ customer_id
    const sql = `
      SELECT c.fullname as customer_name, SUM(o.total_price) as total_amount
      FROM tbl_orders o
      JOIN tbl_customers c ON o.customer_id = c.id
      WHERE o.customer_id = ?
      GROUP BY c.id
    `;
    const [rows] = await pool.query(sql, [customer_id]);
    
    // ถ้าไม่มีออเดอร์ ให้คืนค่า 0
    const result = rows.length > 0 ? rows[0] : { customer_name: req.user.fullname, total_amount: 0 };
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
// ตรวจสอบว่ารันบนเครื่อง Local หรือไม่ ถ้าใช่ให้ app.listen
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}
// จำเป็นต้อง export app เพื่อให้ Vercel นำไปใช้
module.exports = app;