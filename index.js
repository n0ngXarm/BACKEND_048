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
  res.json({ message: "My name is Pisitpong IT. 68319010048" });
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
// Enhanced Landing page
// -------------------------
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>BACKEND_048 — Interactive API Console</title>
  <style>
    :root{--bg:#071126;--card:#071827;--accent:#00d4ff;--muted:#9fb3c8;--text:#e6f6ff}
    body{margin:0;font-family:Inter,system-ui,Segoe UI,Roboto,Arial;background:linear-gradient(180deg,#041425 0%,#071827 100%);color:var(--text);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:28px}
    .wrap{width:100%;max-width:980px}
    .card{background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));border:1px solid rgba(255,255,255,0.04);padding:22px;border-radius:12px;box-shadow:0 10px 40px rgba(2,6,23,0.6)}
    h1{margin:0 0 6px;font-size:20px}
    .muted{color:var(--muted);font-size:13px}
    .cols{display:flex;gap:16px;align-items:flex-start}
    .left{flex:1;min-width:0}
    .right{width:320px}
    .box{background:transparent;padding:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.02);margin-bottom:12px}
    label{display:block;font-size:13px;margin:8px 0 6px;color:var(--muted)}
    input[type="text"], input[type="password"], textarea{width:100%;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.04);background:#021423;color:var(--text);box-sizing:border-box}
    .btn{background:var(--accent);color:#012;padding:8px 10px;border-radius:8px;border:none;cursor:pointer;font-weight:700}
    .btn.secondary{background:transparent;border:1px solid rgba(255,255,255,0.06);color:var(--muted);font-weight:600}
    pre{background:#021423;padding:10px;border-radius:6px;overflow:auto;color:#bfeefb;font-size:13px}
    .row{display:flex;gap:8px;margin-top:8px}
    .small{font-size:13px;color:var(--muted)}
    .token{word-break:break-all;background:#031827;padding:8px;border-radius:6px;border:1px dashed rgba(255,255,255,0.02)}
    footer{margin-top:8px;color:var(--muted);font-size:13px}
    @media(max-width:880px){.cols{flex-direction:column}.right{width:100%}}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>BACKEND_048 — Interactive API Console</h1>
      <p class="muted">ทดสอบ API ได้ทันทีจากหน้าเว็บ — login เพื่อรับ JWT, คัดลอก token, เรียก endpoint ที่ต้องการ</p>

      <div class="cols" style="margin-top:12px">
        <div class="left">
          <div class="box">
            <strong>Quick Endpoints</strong>
            <ul style="margin:8px 0 0;padding:0;list-style:none">
              <li style="padding:8px 0;display:flex;justify-content:space-between;align-items:center"><span>/ping</span><button class="btn" onclick="call('/ping')">Call</button></li>
              <li style="padding:8px 0;display:flex;justify-content:space-between;align-items:center"><span>/api/data</span><button class="btn" onclick="call('/api/data')">Call</button></li>
              <li style="padding:8px 0;display:flex;justify-content:space-between;align-items:center"><span>POST /login</span><button class="btn" onclick="showLogin()">Example</button></li>
              <li style="padding:8px 0;display:flex;justify-content:space-between;align-items:center"><span>/users (protected)</span><button class="btn secondary" onclick="callProtected('/users')">Call (auth)</button></li>
            </ul>
          </div>

          <div class="box">
            <strong>Request / Response</strong>
            <div style="margin-top:8px">
              <pre id="result">No requests yet</pre>
            </div>
            <footer>Server: <span id="serverInfo" class="muted">detecting...</span></footer>
          </div>
        </div>

        <div class="right">
          <div class="box" style="margin-bottom:10px">
            <strong>Login</strong>
            <label>Username</label>
            <input id="username" type="text" placeholder="your_user" />
            <label>Password</label>
            <input id="password" type="password" placeholder="your_password" />
            <div class="row">
              <button class="btn" onclick="login()">Login</button>
              <button class="btn secondary" onclick="logout()">Logout</button>
            </div>
            <div style="margin-top:10px">
              <div class="small">Token (stored in localStorage)</div>
              <div style="display:flex;gap:8px;align-items:center;margin-top:6px">
                <div id="token" class="token">—</div>
                <button class="btn secondary" onclick="copyToken()">Copy</button>
              </div>
            </div>
          </div>

          <div class="box">
            <strong>Examples</strong>
            <div style="margin-top:8px" class="small">
              <div>curl login:</div>
              <pre id="curlLogin">curl -X POST {{origin}}/login -H "Content-Type: application/json" -d '{"username":"your_user","password":"your_password"}'</pre>
              <div style="margin-top:8px">Use token with:</div>
              <pre id="curlAuth">curl -H "Authorization: Bearer &lt;TOKEN&gt;" {{origin}}/users</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const base = window.location.origin;
    document.getElementById('curlLogin').textContent = document.getElementById('curlLogin').textContent.replace('{{origin}}', base);
    document.getElementById('curlAuth').textContent = document.getElementById('curlAuth').textContent.replace('{{origin}}', base);

    function pretty(txt){
      try { return JSON.stringify(typeof txt === 'string' ? JSON.parse(txt) : txt, null, 2); }
      catch(e){ return txt; }
    }

    async function call(path){
      const out = document.getElementById('result');
      out.textContent = 'Loading...';
      try {
        const r = await fetch(base + path);
        const txt = await r.text();
        out.textContent = (r.headers.get('content-type') || '').includes('application/json') ? pretty(txt) : txt;
      } catch(e){
        out.textContent = 'Request failed: ' + e.message;
      }
    }

    async function login(){
      const u = document.getElementById('username').value;
      const p = document.getElementById('password').value;
      if(!u||!p){ alert('กรุณากรอก username และ password'); return; }
      const out = document.getElementById('result');
      out.textContent = 'Logging in...';
      try {
        const r = await fetch(base + '/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, password: p })
        });
        const j = await r.json();
        if(r.ok && j.token){
          localStorage.setItem('api_token', j.token);
          document.getElementById('token').textContent = j.token;
          out.textContent = 'Login successful. Token saved.';
        } else {
          out.textContent = 'Login error: ' + (j.error || JSON.stringify(j));
        }
      } catch(e){
        out.textContent = 'Login failed: ' + e.message;
      }
    }

    function logout(){
      localStorage.removeItem('api_token');
      document.getElementById('token').textContent = '—';
      document.getElementById('result').textContent = 'Logged out';
    }

    function copyToken(){
      const t = localStorage.getItem('api_token') || document.getElementById('token').textContent;
      if(!t || t==='—'){ alert('No token to copy'); return; }
      navigator.clipboard.writeText(t).then(()=> alert('Token copied'));
    }

    async function callProtected(path){
      const token = localStorage.getItem('api_token');
      const out = document.getElementById('result');
      if(!token){ out.textContent = 'No token. Please login first.'; return; }
      out.textContent = 'Loading (auth)...';
      try {
        const r = await fetch(base + path, { headers: { 'Authorization': 'Bearer ' + token }});
        const txt = await r.text();
        out.textContent = (r.headers.get('content-type') || '').includes('application/json') ? pretty(txt) : txt;
      } catch(e){
        out.textContent = 'Request failed: ' + e.message;
      }
    }

    // initialize token display & server info
    (async ()=>{
      const t = localStorage.getItem('api_token');
      if(t) document.getElementById('token').textContent = t;
      try {
        const r = await fetch(base + '/ping');
        const j = await r.json();
        document.getElementById('serverInfo').textContent = j.status ? 'ok — ' + (j.time||'') : JSON.stringify(j);
      } catch(e){
        document.getElementById('serverInfo').textContent = 'unreachable';
      }
    })();
  </script>
</body>
</html>`);
});
