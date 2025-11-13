require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // ✅ เพิ่มตรงนี้
const _auth = require('./middleware/auth'); // safe import

// ensure verifyToken is a function (support both module.exports = fn and exports.verifyToken = fn)
const verifyToken = (typeof _auth === 'function')
  ? _auth
  : ( _auth && typeof _auth.verifyToken === 'function' )
    ? _auth.verifyToken
    : ((req, res, next) => {
        console.warn('Auth middleware missing or invalid. Protected routes will return 503.');
        return res.status(503).json({ error: 'Auth middleware not configured on server' });
      });

const app = express();

// ✅ เปิดใช้ middleware
app.use(cors());
app.use(express.json());

// ✅ ใช้ค่าจาก .env
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});
const SECRET_KEY = process.env.JWT_SECRET; // ✅ ใช้สำหรับสร้าง JWT

// ✅ Route ทดสอบ CORS
app.get("/api/data", (req, res) => {
  res.json({ message: "Hello, Pisitpong!" });
});

// ✅ Route ทดสอบฐานข้อมูล
app.get('/ping', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS now');
    res.json({ status: 'ok', time: rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// =====================
// 🔑 LOGIN
// =====================
app.get('/ping', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS now');
    res.json({ status: 'ok', time: rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// =====================
// 🔑 LOGIN
// =====================
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM tbl_users WHERE username = ?', [username]);
    // ...existing code...
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// =====================
// 🔒 CRUD Users (Protected)
// =====================
app.get('/users',verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, firstname, fullname, lastname, username, status FROM tbl_users');
    // ...existing code...
  } catch (err) {
    res.status(500).json({ error: 'Query failed' });
  }
});

app.get('/users/:id',verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT id, firstname, fullname, lastname, username, status FROM tbl_users WHERE id = ?', [id]);
    // ...existing code...
  } catch (err) {
    res.status(500).json({ error: 'Query failed' });
  }
});

app.post('/users', async (req, res) => {
  const { firstname, fullname, lastname, username, password, status } = req.body;

  try {
    if (!password) return res.status(400).json({ error: 'Password is required' });
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO tbl_users (firstname, fullname, lastname, username, password, status) VALUES (?, ?, ?, ?, ?, ?)',
      [firstname, fullname, lastname, username, hashedPassword, status]
    );
    // ...existing code...
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Insert failed' });
  }
});

app.put('/users/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { firstname, fullname, lastname, username, password, status } = req.body;

  try {
    let query = `UPDATE tbl_users SET firstname = ?, fullname = ?, last_name = ?, username = ?, status = ?`;
    const params = [firstname, fullname, lastname, username, status];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await pool.query(query, params);
    // ...existing code...
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
});

app.delete('/users/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM tbl_users WHERE id = ?', [id]);
    // ...existing code...
  } catch (err) {
    console.error('❌ Delete Error:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
});// =====================
// ✅ เริ่มเซิร์ฟเวอร์
// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
