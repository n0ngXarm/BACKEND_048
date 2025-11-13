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
// Simple API Console (responsive + detailed usage)
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
  :root{
    --bg:#071624; --card:#041427; --accent:#06b6d4; --muted:#9fb3c8; --text:#e6f6ff;
    --radius:10px;
  }
  html,body{height:100%;margin:0;background:linear-gradient(180deg,#041424,#071827);color:var(--text);font-family:Inter,system-ui,Roboto,Arial}
  .wrap{min-height:100%;display:flex;align-items:center;justify-content:center;padding:20px}
  .card{width:100%;max-width:980px;background:linear-gradient(180deg,rgba(255,255,255,0.02),transparent);border:1px solid rgba(255,255,255,0.03);border-radius:var(--radius);padding:18px;box-shadow:0 12px 40px rgba(2,6,23,0.6)}
  h1{margin:0 0 6px;font-size:clamp(18px,1.8vw,22px)}
  .muted{color:var(--muted);font-size:clamp(12px,1.2vw,14px)}
  .top{display:flex;gap:12px;align-items:center;margin-bottom:12px;flex-wrap:wrap}
  select,input,textarea,button{border-radius:10px;border:1px solid rgba(255,255,255,0.04);background:#021423;color:var(--text);padding:10px}
  select,input{height:44px}
  input[type="text"]{min-width:120px}
  textarea{min-height:90px;resize:vertical}
  .method{width:100px}
  .path{flex:1;min-width:180px}
  .btn{background:var(--accent);color:#012;border:none;padding:10px 12px;cursor:pointer;font-weight:700;border-radius:10px}
  .btn.ghost{background:transparent;border:1px solid rgba(255,255,255,0.06);color:var(--muted)}
  .grid{display:grid;grid-template-columns:1fr 320px;gap:14px}
  .panel{background:transparent;padding:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.02)}
  .small{font-size:13px;color:var(--muted)}
  pre{background:#021423;padding:10px;border-radius:8px;overflow:auto;color:#bfeefb;font-size:13px;max-height:260px}
  .token-row{display:flex;gap:8px;align-items:center}
  .help{margin-top:12px;background:rgba(255,255,255,0.012);padding:12px;border-radius:8px}
  details summary{cursor:pointer;font-weight:700}
  details p, details li{color:var(--muted);font-size:13px}
  ul{padding-left:18px;margin:6px 0}
  @media(max-width:900px){ .grid{grid-template-columns:1fr} .panel{min-height:0} }
  @media(max-width:520px){
    .method{width:86px}
    .top{gap:8px}
    textarea{min-height:120px}
  }
</style>
</head>
<body>
  <div class="wrap">
    <div class="card" role="main" aria-labelledby="title">
      <h1 id="title">BACKEND_048 — Simple API Console</h1>
      <p class="muted">ใช้งานรวดเร็ว: เลือก method, ใส่ path, (option) body เป็น JSON แล้วกด Send — เปิด "Use token" เพื่อแนบ Authorization</p>

      <div class="top" role="region" aria-label="request controls">
        <select id="method" class="method" aria-label="HTTP method"><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option><option>PATCH</option></select>
        <input id="path" class="path" type="text" placeholder="/ping" value="/ping" aria-label="Request path"/>
        <button class="btn" id="send">Send</button>
        <button class="btn ghost" id="copyCurl">Copy curl</button>
        <label class="small" style="margin-left:auto"><input id="useToken" type="checkbox"/> Use token</label>
      </div>

      <div class="grid">
        <div class="panel" aria-label="request body">
          <div style="display:flex;gap:10px;align-items:flex-start">
            <div style="flex:1">
              <label class="small" for="body">Body (raw JSON or text)</label>
              <textarea id="body" placeholder='{"key":"value"}'></textarea>
            </div>
          </div>

          <div style="display:flex;gap:8px;margin-top:10px;align-items:center">
            <div class="token-row" style="flex:1">
              <input id="tokenInput" type="text" placeholder="paste or save token here" aria-label="token input"/>
              <button class="btn" id="saveToken">Save</button>
            </div>
            <button class="btn ghost" id="loadToken">Load</button>
            <button class="btn ghost" id="clearToken">Clear</button>
          </div>

          <div style="margin-top:12px" class="small">
            Quick: <button class="btn ghost" onclick="quick('/ping')">/ping</button>
            <button class="btn ghost" onclick="quick('/api/data')">/api/data</button>
            <button class="btn ghost" onclick="quickProtected('/users')">/users (auth)</button>
          </div>

          <div class="help" style="margin-top:12px">
            <details open>
              <summary>How to use — step by step (คลิกเพื่อขยาย/ย่อ)</summary>
              <ol>
                <li>เลือก HTTP method และใส่ path เช่น <code>/ping</code> หรือ <code>/users</code>.</li>
                <li>ถ้าส่งข้อมูลให้กรอก JSON ในช่อง Body (ตัวอย่าง: <code>{"username":"user","password":"pass"}</code>).</li>
                <li>ถ้าต้องการเรียก endpoint ที่ต้องใช้ JWT ให้ติ๊ก <strong>Use token</strong> แล้วบันทึก token ใน localStorage โดยวาง token ลงในช่องและกด <em>Save</em> หรือใช้ปุ่ม <em>Load</em> เพื่อดึง token ที่บันทึกไว้แล้ว.</li>
                <li>กด <strong>Send</strong> เพื่อส่งคำขอ — ผลลัพธ์จะแสดงด้านขวา (status, headers, body).</li>
                <li>กด <strong>Copy curl</strong> เพื่อคัดลอกคำสั่ง curl ที่เทียบเท่า.</li>
              </ol>
              <p>ตัวอย่าง curl สำหรับ login:</p>
              <pre>curl -X POST ${req.protocol}://${req.get('host')}/login -H "Content-Type: application/json" -d '{"username":"your_user","password":"your_password"}'</pre>
              <p>หลัง login จะได้ token ให้บันทึกลงในช่อง token แล้วใช้งานกับ endpoints ที่ต้องการ Authorization เช่น /users</p>
            </details>
          </div>
        </div>

        <div class="panel" aria-label="response">
          <div class="small">Response — status / headers / body</div>
          <pre id="status">Status: —</pre>
          <div style="margin-top:8px"><strong class="small">Headers</strong><pre id="respHeaders">—</pre></div>
          <div style="margin-top:8px"><strong class="small">Body</strong><pre id="respBody">—</pre></div>
        </div>
      </div>

      <p class="muted" style="margin-top:12px">Server: <span id="serverInfo">detecting...</span></p>
    </div>
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
    if(body) parts.push("-H 'Content-Type: application/json' -d '" + body.replace(/'/g,"\\'") + "'");
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
