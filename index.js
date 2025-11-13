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
<title>BACKEND_048 — API Console (Postman-like)</title>
<style>
  :root{--bg:#071425;--card:#071827;--accent:#00d4ff;--muted:#9fb3c8;--text:#e6f6ff}
  body{margin:0;font-family:Inter,system-ui,Segoe UI,Roboto,Arial;background:linear-gradient(180deg,#041425,#071827);color:var(--text);min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:28px}
  .wrap{width:100%;max-width:1100px}
  .card{background:linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01));border:1px solid rgba(255,255,255,0.04);padding:18px;border-radius:10px;box-shadow:0 8px 30px rgba(2,6,23,0.6)}
  h1{margin:0 0 6px;font-size:18px}
  .muted{color:var(--muted);font-size:13px}
  .toolbar{display:flex;gap:8px;align-items:center;margin-top:10px}
  select,input[type="text"]{padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.04);background:#021423;color:var(--text)}
  .flex{display:flex;gap:12px}
  .panel{display:grid;grid-template-columns:1fr 420px;gap:12px;margin-top:12px}
  .section{background:#061426;padding:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.02)}
  textarea{width:100%;min-height:140px;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.04);background:#021423;color:var(--text);box-sizing:border-box}
  .row{display:flex;gap:8px;align-items:center}
  .btn{background:var(--accent);color:#012;padding:8px 10px;border-radius:8px;border:none;cursor:pointer;font-weight:700}
  .btn.ghost{background:transparent;border:1px solid rgba(255,255,255,0.06);color:var(--muted)}
  table{width:100%;border-collapse:collapse}
  td,th{padding:6px;font-size:13px;border-bottom:1px dashed rgba(255,255,255,0.02);vertical-align:top}
  .small{font-size:13px;color:var(--muted)}
  pre{background:#021423;padding:10px;border-radius:6px;overflow:auto;color:#bfeefb;font-size:13px}
  .hdrrow{display:flex;gap:8px;margin-bottom:6px}
  .hdrrow input{flex:1}
  @media(max-width:980px){.panel{grid-template-columns:1fr}}
</style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>BACKEND_048 — API Console (Postman-like)</h1>
      <p class="muted">ส่ง HTTP request, ตั้งค่า headers/body, ดู response (status, headers, body). ใช้ token จาก localStorage เป็น Authorization ได้</p>

      <div class="toolbar">
        <select id="method"><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option><option>PATCH</option></select>
        <input id="path" type="text" value="/ping" style="flex:1" />
        <button class="btn" id="send">Send</button>
        <button class="btn ghost" id="copyCurl">Copy curl</button>
        <button class="btn ghost" id="useToken">Use stored token</button>
        <div style="margin-left:auto" class="small">Server: <span id="serverInfo">detecting...</span></div>
      </div>

      <div class="panel">
        <div class="section">
          <h3 style="margin:0 0 6px">Headers</h3>
          <div id="headersList">
            <div class="hdrrow"><input placeholder="Header name" class="h-name" value="Accept"/><input placeholder="Header value" class="h-value" value="application/json"/><button class="btn ghost" onclick="removeHdr(this)">×</button></div>
          </div>
          <div style="margin-top:8px" class="row">
            <button class="btn ghost" onclick="addHdr()">+ Add Header</button>
            <button class="btn ghost" onclick="clearHdrs()">Clear</button>
          </div>

          <h3 style="margin-top:12px;margin-bottom:6px">Body</h3>
          <div class="small">ใช้สำหรับ POST/PUT/PATCH — raw JSON หรือ text</div>
          <textarea id="body" placeholder='{ "key": "value" }'></textarea>
        </div>

        <div class="section">
          <h3 style="margin:0 0 6px">Response</h3>
          <div class="small">Status: <span id="status">—</span></div>
          <div style="margin-top:8px">
            <strong>Headers</strong>
            <pre id="respHeaders">—</pre>
          </div>
          <div style="margin-top:8px">
            <strong>Body</strong>
            <pre id="respBody">—</pre>
          </div>
          <div style="margin-top:8px" class="row">
            <button class="btn ghost" id="saveExample">Save to local</button>
            <button class="btn ghost" id="clearResp">Clear</button>
          </div>
        </div>
      </div>
    </div>
  </div>

<script>
  const base = window.location.origin;
  document.getElementById('path').value = '/ping';

  function addHdr(name='', value=''){
    const div = document.createElement('div');
    div.className = 'hdrrow';
    div.innerHTML = '<input placeholder="Header name" class="h-name" value="'+escapeHtml(name)+'"/><input placeholder="Header value" class="h-value" value="'+escapeHtml(value)+'"/><button class="btn ghost" onclick="removeHdr(this)">×</button>';
    document.getElementById('headersList').appendChild(div);
  }
  function removeHdr(btn){ btn.parentElement.remove(); }
  function clearHdrs(){ document.getElementById('headersList').innerHTML=''; }

  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }

  function buildHeaders(){
    const headers = {};
    document.querySelectorAll('#headersList .hdrrow').forEach(r=>{
      const k = r.querySelector('.h-name').value.trim();
      const v = r.querySelector('.h-value').value;
      if(k) headers[k] = v;
    });
    return headers;
  }

  async function send(){
    const method = document.getElementById('method').value;
    const path = document.getElementById('path').value;
    const bodyText = document.getElementById('body').value;
    const outBody = document.getElementById('respBody');
    const outHdr = document.getElementById('respHeaders');
    const outStatus = document.getElementById('status');

    let url = path.startsWith('http') ? path : base + path;
    const headers = buildHeaders();

    // if body looks like JSON and no Content-Type, set it
    if(bodyText && !('Content-Type' in headers)){
      try { JSON.parse(bodyText); headers['Content-Type'] = 'application/json'; } catch(e){}
    }

    try {
      const opts = { method, headers };
      if(method !== 'GET' && method !== 'HEAD' && bodyText) opts.body = bodyText;

      const res = await fetch(url, opts);
      outStatus.textContent = res.status + ' ' + res.statusText;

      // headers
      const hdrObj = {};
      res.headers.forEach((v,k)=> hdrObj[k] = v);
      outHdr.textContent = JSON.stringify(hdrObj, null, 2);

      // body
      const txt = await res.text();
      try {
        outBody.textContent = JSON.stringify(JSON.parse(txt), null, 2);
      } catch(e){
        outBody.textContent = txt;
      }
    } catch(e){
      outStatus.textContent = 'Request failed';
      outHdr.textContent = '—';
      outBody.textContent = e.message;
    }
  }

  document.getElementById('send').addEventListener('click', send);
  document.getElementById('clearResp').addEventListener('click', ()=>{
    document.getElementById('status').textContent='—';
    document.getElementById('respHeaders').textContent='—';
    document.getElementById('respBody').textContent='—';
  });

  document.getElementById('copyCurl').addEventListener('click', ()=>{
    const method = document.getElementById('method').value;
    const path = document.getElementById('path').value;
    const headers = buildHeaders();
    const body = document.getElementById('body').value;
    let url = path.startsWith('http') ? path : base + path;
    let parts = ['curl -X', method, '"' + url + '"'];
    Object.keys(headers).forEach(k=> parts.push('-H "'+k+': '+headers[k].replace(/"/g,'\\"')+'"'));
    if(body) parts.push("-d '" + body.replace(/'/g,"\\'") + "'");
    const curl = parts.join(' ');
    navigator.clipboard.writeText(curl).then(()=> alert('curl copied'));
  });

  // use token button: fill Authorization header from localStorage token
  document.getElementById('useToken').addEventListener('click', ()=>{
    const token = localStorage.getItem('api_token');
    if(!token) return alert('No token in localStorage (key api_token)');
    // ensure header exists
    let found=false;
    document.querySelectorAll('#headersList .hdrrow').forEach(r=>{
      const k = r.querySelector('.h-name').value.trim().toLowerCase();
      if(k === 'authorization'){ r.querySelector('.h-value').value = 'Bearer ' + token; found=true; }
    });
    if(!found) addHdr('Authorization','Bearer ' + token);
  });

  // save example (store last response)
  document.getElementById('saveExample').addEventListener('click', ()=>{
    const data = {
      method: document.getElementById('method').value,
      path: document.getElementById('path').value,
      headers: buildHeaders(),
      body: document.getElementById('body').value,
      response: {
        status: document.getElementById('status').textContent,
        headers: document.getElementById('respHeaders').textContent,
        body: document.getElementById('respBody').textContent
      },
      ts: Date.now()
    };
    localStorage.setItem('last_req', JSON.stringify(data));
    alert('Saved to localStorage (last_req)');
  });

  // init: add a blank header row and show server status
  (async ()=>{
    addHdr(); // blank row for convenience
    try {
      const r = await fetch(base + '/ping');
      const j = await r.json();
      document.getElementById('serverInfo').textContent = j.status ? 'ok' : 'unreachable';
    } catch(e){
      document.getElementById('serverInfo').textContent = 'unreachable';
    }
  })();
</script>
</body>
</html>`);
});
