require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const _auth = require('./middleware/auth'); // safe import

// ensure verifyToken is a function
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
const SECRET_KEY = process.env.JWT_SECRET;

// ✅ Route ทดสอบ CORS
app.get("/api/data", (req, res) => {
  res.json({ message: "My name is Pisitpong IT. 68319010048" });
});

// ✅ Route ทดสอบฐานข้อมูล (เก็บไว้แค่อันเดียวพอ)
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
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// =====================
// 🔒 CRUD Users (Protected)
// =====================

// 1. อ่านผู้ใช้ทั้งหมด (แก้ Logic ผิดให้แล้ว)
app.get('/users', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, firstname, fullname, lastname, username, status FROM tbl_users');
    // ✅ ส่งข้อมูล users กลับไป ไม่ใช่ส่งข้อความว่า created
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Query failed' });
  }
});

// 2. อ่านผู้ใช้ตาม ID (เติมโค้ดที่หายไปให้แล้ว)
app.get('/users/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT id, firstname, fullname, lastname, username, status FROM tbl_users WHERE id = ?', [id]);
    if (rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
    }
    // ✅ ต้องมีบรรทัดนี้ ไม่งั้นโหลดนาน
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Query failed' });
  }
});

// 3. เพิ่มผู้ใช้ (อันนี้ของเดิม OK แต่จัด Format ให้)
app.post('/users', async (req, res) => {
  const { firstname, fullname, lastname, username, password, status } = req.body;

  try {
    if (!password) return res.status(400).json({ error: 'Password is required' });
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO tbl_users (firstname, fullname, lastname, username, password, status) VALUES (?, ?, ?, ?, ?, ?)',
      [firstname, fullname, lastname, username, hashedPassword, status]
    );
    
    res.status(201).json({
        message: "User created successfully",
        userId: result.insertId,
        user: { firstname, lastname, username, status }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Insert failed' });
  }
});

// 4. แก้ไขผู้ใช้ (เติมโค้ดที่หายไปให้แล้ว)
app.put('/users/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { firstname, fullname, lastname, username, password, status } = req.body;

  try {
    let query = `UPDATE tbl_users SET firstname = ?, fullname = ?, lastname = ?, username = ?, status = ?`; // แก้ last_name เป็น lastname ให้ตรงกับ DB ส่วนใหญ่
    const params = [firstname, fullname, lastname, username, status];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await pool.query(query, params);
    
    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found or no changes made' });
    }

    // ✅ ต้องตอบกลับ ไม่งั้นหมุนติ้ว
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// 5. ลบผู้ใช้ (เติมโค้ดที่หายไปให้แล้ว)
app.delete('/users/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM tbl_users WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
    }

    // ✅ ต้องตอบกลับ
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Error:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// =====================
// ✅ เริ่มเซิร์ฟเวอร์
// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// -------------------------
// Simple API Console (Keep as is)
// -------------------------
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Pisitpong_BACKEND_048 — Simple API Console (Docs)</title>
<style>
  :root{--bg:#041425;--card:#041427;--accent:#06b6d4;--muted:#9fb3c8;--text:#e6f6ff}
  body{margin:0;font-family:Inter,system-ui,Roboto,Arial;background:linear-gradient(180deg,#041425,#071827);color:var(--text);padding:18px}
  .container{max-width:1100px;margin:0 auto}
  .card{background:linear-gradient(180deg,rgba(255,255,255,0.02),transparent);padding:18px;border-radius:10px;border:1px solid rgba(255,255,255,0.03)}
  h1{margin:0 0 6px}
  .muted{color:var(--muted);font-size:14px}
  .cols{display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap}
  .left{flex:1;min-width:300px}
  .right{width:360px}
  .panel{background:#021423;padding:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.02);margin-bottom:12px}
  pre{background:#011722;padding:10px;border-radius:6px;overflow:auto;color:#bfeefb}
  code{background:rgba(255,255,255,0.02);padding:2px 6px;border-radius:4px;color:#bfeefb}
  .btn{background:var(--accent);color:#012;padding:8px 10px;border-radius:8px;border:none;cursor:pointer}
  .small{font-size:13px;color:var(--muted)}
  @media(max-width:980px){.cols{flex-direction:column}.right{width:100%}}
</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>Pisitpong_BACKEND_048 — API Console</h1>
      <p class="muted">API พร้อมใช้งานแล้ว (แก้ไข Bug แล้ว)</p>
      <div class="cols" style="margin-top:12px">
        <div class="left">
           <div class="panel">
             <h3>Status</h3>
             <p style="color:#4ade80">✅ Code Fixed & Running</p>
             <ul>
                <li>GET /users - Fixed (Returns list)</li>
                <li>GET /users/:id - Fixed (Returns user)</li>
                <li>PUT /users/:id - Fixed (Updates user)</li>
                <li>DELETE /users/:id - Fixed (Deletes user)</li>
             </ul>
           </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`);
});