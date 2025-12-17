require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs'); // ใช้ bcryptjs ตามที่คุณส่งมา (หรือง่ายต่อการติดตั้งกว่า)
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// ==========================================
// 1. Config & Database Connection
// ==========================================
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const SECRET_KEY = process.env.JWT_SECRET || 'secret_fallback_key'; // ควรมีค่า default กัน error

// ==========================================
// 2. Middleware (ย้ายมารวมที่นี่)
// ==========================================
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    // รูปแบบ Header คือ: "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
        
        req.user = user; // เก็บข้อมูล user (id, fullname) ไว้ใช้ใน route ถัดไป
        next();
    });
}

// Check Database Connection (Optional: Ping)
app.get('/ping', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT NOW() as time');
        res.json({ status: 'ok', server_time: rows[0].time });
    } catch (err) {
        res.status(500).json({ error: 'Database connection failed', details: err.message });
    }
});

// ==========================================
// 3. Authentication Routes
// ==========================================

// 3.1 Register
app.post('/auth/register', async (req, res) => {
  const { username, password, fullname } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

  try {
    // เช็คก่อนว่า username ซ้ำไหม
    const [existing] = await pool.query('SELECT id FROM tbl_customers WHERE username = ?', [username]);
    if (existing.length > 0) return res.status(400).json({ error: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await pool.query(
      'INSERT INTO tbl_customers (username, password, fullname) VALUES (?, ?, ?)',
      [username, hashedPassword, fullname]
    );
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3.2 Login
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM tbl_customers WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ message: 'User not found' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // สร้าง Token
    const token = jwt.sign(
        { id: user.id, fullname: user.fullname }, 
        SECRET_KEY, 
        { expiresIn: '1h' }
    );
    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. Data Routes (Protected & Public)
// ==========================================

// 4.1 Get Customers (ต้อง Login)
app.get('/customers', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, fullname, created_at FROM tbl_customers');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4.2 Get Menus (Public - ไม่ต้อง Login ก็ดูเมนูได้)
app.get('/menus', async (req, res) => {
  try {
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

// 4.3 Place Order (ต้อง Login)
app.post('/orders', verifyToken, async (req, res) => {
  const { restaurant_id, menu_id, quantity } = req.body;
  const customer_id = req.user.id; // ดึง ID จาก Token โดยตรง

  if (!restaurant_id || !menu_id || !quantity) {
      return res.status(400).json({ error: 'Missing order details' });
  }

  try {
    // ดึงราคาเมนู
    const [menus] = await pool.query('SELECT price FROM tbl_menus WHERE menu_id = ?', [menu_id]);
    if (menus.length === 0) return res.status(404).json({ message: 'Menu not found' });

    const total_price = menus[0].price * quantity;

    // บันทึก Order
    const [result] = await pool.query(
      'INSERT INTO tbl_orders (customer_id, restaurant_id, menu_id, quantity, total_price) VALUES (?, ?, ?, ?, ?)',
      [customer_id, restaurant_id, menu_id, quantity, total_price]
    );

    res.status(201).json({ 
        message: 'Order placed successfully', 
        order_id: result.insertId, 
        total_price 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4.4 Order Summary (ต้อง Login)
app.get('/orders/summary', verifyToken, async (req, res) => {
  const customer_id = req.user.id;
  try {
    const sql = `
      SELECT c.fullname as customer_name, SUM(o.total_price) as total_amount
      FROM tbl_orders o
      JOIN tbl_customers c ON o.customer_id = c.id
      WHERE o.customer_id = ?
      GROUP BY c.id
    `;
    const [rows] = await pool.query(sql, [customer_id]);
    
    // ถ้าไม่มีออเดอร์ ให้คืนค่า 0 แต่ยังส่งชื่อลูกค้ากลับไป
    const result = rows.length > 0 
        ? rows[0] 
        : { customer_name: req.user.fullname, total_amount: 0 };
        
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. Server Start
// ==========================================
const PORT = process.env.PORT || 3000;

// ตรวจสอบว่ารันบนเครื่อง Local หรือไม่
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

// Export สำหรับ Vercel หรือ Testing
module.exports = app;