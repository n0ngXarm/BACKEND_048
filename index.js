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
// Simple API Console (easy to use)
// -------------------------
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>BACKEND_048 — Simple API Console</title>
<style>
  body{font-family:system-ui,Segoe UI,Roboto,Arial;background:#0b1520;color:#e6f6ff;margin:0;padding:24px;display:flex;justify-content:center}
  .card{width:100%;max-width:880px;background:#071624;padding:18px;border-radius:10px;box-shadow:0 8px 30px rgba(0,0,0,0.6)}
  h1{margin:0 0 8px;font-size:18px}
  .row{display:flex;gap:8px;align-items:center;margin-bottom:8px}
  select,input,textarea,button{border-radius:8px;border:1px solid rgba(255,255,255,0.04);background:#021423;color:#e6f6ff;padding:8px}
  input,textarea{flex:1}
  textarea{min-height:120px;resize:vertical}
  .small{font-size:13px;color:#9fb3c8}
  .btn{background:#00d4ff;color:#012;border:none;padding:8px 10px;cursor:pointer;font-weight:700}
  .ghost{background:transparent;border:1px solid rgba(255,255,255,0.06);color:#9fb3c8}
  pre{background:#021423;padding:10px;border-radius:6px;overflow:auto;color:#bfeefb;font-size:13px}
  .flex-right{margin-left:auto}
  label{font-size:13px;color:#9fb3c8;margin-right:6px}
  .token-box{display:flex;gap:8px;align-items:center;margin-top:6px}
  @media(max-width:720px){.row{flex-direction:column;align-items:stretch}}
</style>
</head>
<body>
  <div class="card" role="main">
    <h1>BACKEND_048 — Simple API Console</h1>
    <p class="small">เลือก method, ใส่ path (เช่น /ping หรือ /users), ใส่ body เป็น JSON แล้วกด Send. เปิด "Use token" เพื่อแนบ Authorization จาก localStorage</p>

    <div class="row">
      <select id="method"><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option></select>
      <input id="path" placeholder="/ping" value="/ping"/>
      <button class="btn" id="send">Send</button>
      <button class="ghost" id="copyCurl">Copy curl</button>
      <label class="flex-right"><input type="checkbox" id="useToken"/> Use token</label>
    </div>

    <div class="row">
      <label style="width:80px">Body</label>
      <textarea id="body" placeholder='{"key":"value"}'></textarea>
    </div>

    <div style="display:flex;gap:12px;align-items:flex-start">
      <div style="flex:1">
        <div class="small">Response — status / headers / body</div>
        <pre id="status">Status: —</pre>
        <pre id="respHeaders">Headers: —</pre>
        <pre id="respBody">Body: —</pre>
      </div>

      <div style="width:260px">
        <div class="small">Token (localStorage key: api_token)</div>
        <div class="token-box">
          <input id="tokenInput" placeholder="paste or save token here" />
          <button class="btn" id="saveToken">Save</button>
        </div>
        <div style="margin-top:8px;display:flex;gap:8px">
          <button class="ghost" id="loadToken">Load</button>
          <button class="ghost" id="clearToken">Clear</button>
        </div>
        <p class="small" style="margin-top:12px">Quick endpoints:</p>
        <div style="display:flex;flex-direction:column;gap:6px">
          <button class="ghost" onclick="quick('/ping')">/ping</button>
          <button class="ghost" onclick="quick('/api/data')">/api/data</button>
          <button class="ghost" onclick="quickProtected('/users')">/users (auth)</button>
        </div>
      </div>
    </div>

    <p class="small" style="margin-top:12px">Server: <span id="serverInfo">detecting...</span></p>
  </div>

<script>
  const base = window.location.origin;
  document.getElementById('path').value = '/ping';

  function buildHeaders(){
    const headers = {};
    if(document.getElementById('useToken').checked){
      const t = localStorage.getItem('api_token');
      if(t) headers['Authorization'] = 'Bearer ' + t;
    }
    return headers;
  }

  async function send(){
    const method = document.getElementById('method').value;
    const path = document.getElementById('path').value.trim();
    const bodyText = document.getElementById('body').value;
    const headers = buildHeaders();

    if(bodyText && !headers['Content-Type']){
      try { JSON.parse(bodyText); headers['Content-Type']='application/json'; } catch(e){}
    }

    const url = path.startsWith('http') ? path : base + path;
    document.getElementById('status').textContent = 'Status: loading...';
    try {
      const opts = { method, headers };
      if(method !== 'GET' && method !== 'HEAD' && bodyText) opts.body = bodyText;
      const res = await fetch(url, opts);
      document.getElementById('status').textContent = 'Status: ' + res.status + ' ' + res.statusText;
      const hdrs = {}; res.headers.forEach((v,k)=> hdrs[k]=v);
      document.getElementById('respHeaders').textContent = JSON.stringify(hdrs, null, 2);
      const txt = await res.text();
      try { document.getElementById('respBody').textContent = JSON.stringify(JSON.parse(txt), null, 2); } catch(e){ document.getElementById('respBody').textContent = txt; }
    } catch (e){
      document.getElementById('status').textContent = 'Status: failed';
      document.getElementById('respHeaders').textContent = 'Headers: —';
      document.getElementById('respBody').textContent = e.message;
    }
  }

  document.getElementById('send').addEventListener('click', send);
  document.getElementById('saveToken').addEventListener('click', ()=>{
    const v = document.getElementById('tokenInput').value.trim();
    if(!v) return alert('Enter token to save');
    localStorage.setItem('api_token', v);
    alert('Token saved (api_token)');
  });
  document.getElementById('loadToken').addEventListener('click', ()=>{
    const t = localStorage.getItem('api_token') || '';
    document.getElementById('tokenInput').value = t;
    alert(t ? 'Token loaded into input' : 'No token found');
  });
  document.getElementById('clearToken').addEventListener('click', ()=>{
    localStorage.removeItem('api_token');
    document.getElementById('tokenInput').value = '';
    alert('Token cleared');
  });

  document.getElementById('copyCurl').addEventListener('click', ()=>{
    const method = document.getElementById('method').value;
    const path = document.getElementById('path').value;
    const body = document.getElementById('body').value;
    const url = path.startsWith('http') ? path : base + path;
    let parts = ['curl -X', method, '"' + url + '"'];
    if(document.getElementById('useToken').checked){
      const t = localStorage.getItem('api_token');
      if(t) parts.push('-H "Authorization: Bearer ' + t.replace(/"/g,'\\"') + '"');
    }
    if(body) parts.push("-d '" + body.replace(/'/g,"\\'") + "'");
    navigator.clipboard.writeText(parts.join(' ')).then(()=>alert('curl copied'));
  });

  function quick(p){ document.getElementById('path').value = p; document.getElementById('method').value = 'GET'; send(); }
  function quickProtected(p){ document.getElementById('path').value = p; document.getElementById('method').value = 'GET'; document.getElementById('useToken').checked = true; send(); }

  // init server info
  (async ()=>{
    try {
      const r = await fetch(base + '/ping');
      const j = await r.json();
      document.getElementById('serverInfo').textContent = j.status ? 'ok — ' + (j.time||'') : 'unreachable';
    } catch(e){
      document.getElementById('serverInfo').textContent = 'unreachable';
    }
  })();
</script>
</body>
</html>`);
});
