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

// -------------------------
// Landing page for browser
// -------------------------
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>BACKEND_048 - API</title>
  <style>
    :root{--bg:#0f1724;--card:#0b1220;--accent:#06b6d4;--muted:#94a3b8;--text:#e6eef6}
    body{margin:0;font-family:Inter,system-ui,Segoe UI,Roboto,"Helvetica Neue",Arial;background:linear-gradient(180deg,#071025 0%,#081426 60%);color:var(--text);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
    .card{max-width:900px;width:100%;background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));border:1px solid rgba(255,255,255,0.04);padding:28px;border-radius:12px;box-shadow:0 6px 30px rgba(2,6,23,0.6)}
    h1{margin:0 0 6px;font-size:20px}
    p.lead{margin:0 0 18px;color:var(--muted)}
    .grid{display:grid;grid-template-columns:1fr 320px;gap:18px}
    .box{background:var(--card);padding:14px;border-radius:8px;border:1px solid rgba(255,255,255,0.02)}
    .endpoints{list-style:none;padding:0;margin:0}
    .endpoints li{padding:8px 0;border-bottom:1px dashed rgba(255,255,255,0.02);display:flex;justify-content:space-between;align-items:center;font-size:14px}
    .btn{background:var(--accent);color:#012;padding:8px 10px;border-radius:8px;border:none;cursor:pointer;font-weight:600}
    .muted{color:var(--muted);font-size:13px}
    pre{background:#021423;padding:10px;border-radius:6px;overflow:auto;color:#bfeefb;font-size:13px}
    footer{margin-top:12px;color:var(--muted);font-size:13px}
    @media(max-width:820px){.grid{grid-template-columns:1fr;}}
  </style>
</head>
<body>
  <div class="card" role="main">
    <h1>BACKEND_048 — API Landing</h1>
    <p class="lead">หน้าสำหรับตรวจสอบบริการเบื้องต้น: ดูสถานะ, ทดลองเรียก API, และดูตัวอย่างการ login</p>
    <div class="grid">
      <div class="box">
        <h3 style="margin:0 0 8px">Available endpoints</h3>
        <ul class="endpoints">
          <li><span>/ping</span><button class="btn" onclick="call('/ping')">Check</button></li>
          <li><span>/api/data</span><button class="btn" onclick="call('/api/data')">Check</button></li>
          <li><span>POST /login</span><button class="btn" onclick="showLogin()">Example</button></li>
          <li><span>/users (protected)</span><span class="muted">Requires JWT</span></li>
        </ul>
        <div style="margin-top:12px">
          <strong>Example login payload</strong>
          <pre id="loginExample">{
  "username": "your_user",
  "password": "your_password"
}</pre>
        </div>
      </div>

      <div class="box">
        <h3 style="margin:0 0 8px">Quick test</h3>
        <div style="display:flex;gap:8px;margin-bottom:12px">
          <button class="btn" onclick="call('/ping')">Ping</button>
          <button class="btn" onclick="call('/api/data')">API Data</button>
        </div>
        <div>
          <strong>Result</strong>
          <pre id="result">No requests yet</pre>
        </div>
        <footer>Server: <span id="serverInfo" class="muted">detecting...</span></footer>
      </div>
    </div>
  </div>

  <script>
    const base = window.location.origin;
    async function call(path) {
      const out = document.getElementById('result');
      out.textContent = 'Loading...';
      try {
        const res = await fetch(base + path);
        const txt = await res.text();
        out.textContent = (res.ok ? txt : 'Error ' + res.status + '\\n' + txt);
      } catch (e) {
        out.textContent = 'Request failed: ' + e.message;
      }
    }
    function showLogin() {
      alert('ตัวอย่าง: เปิด DevTools หรือใช้ curl:\\n\\nPOST ' + base + '/login\\nContent-Type: application/json\\n\\n' + JSON.stringify({username:'your_user',password:'your_password'},null,2));
    }
    // show server info by calling /ping silently
    (async ()=> {
      try {
        const r = await fetch(base + '/ping');
        const j = await r.json();
        document.getElementById('serverInfo').textContent = j.status ? 'ok — ' + (j.time||'') : JSON.stringify(j);
      } catch(e) {
        document.getElementById('serverInfo').textContent = 'unreachable';
      }
    })();
  </script>
</body>
</html>`);
});
