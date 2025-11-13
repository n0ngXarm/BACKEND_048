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
  details summary{cursor:pointer;font-weight:700}
  ul{margin:6px 0 12px 18px;color:var(--muted)}
  .btn{background:var(--accent);color:#012;padding:8px 10px;border-radius:8px;border:none;cursor:pointer}
  .small{font-size:13px;color:var(--muted)}
  @media(max-width:980px){.cols{flex-direction:column}.right{width:100%}}
</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>Pisitpong_BACKEND_048 — API Console & Documentation</h1>
      <p class="muted">หน้าเดียวครบ: ทดสอบ API, ดูตัวอย่างคำสั่ง และอ่านคำอธิบายการใช้งานอย่างละเอียด</p>

      <div class="cols" style="margin-top:12px">
        <div class="left">
          <div class="panel">
            <h3>Overview</h3>
            <p class="small">บริการนี้มี endpoint พื้นฐานดังนี้ — ใช้หน้าเว็บนี้เพื่อทดลองเรียก API ได้ทันที</p>
            <ul>
              <li><code>GET /ping</code> — ตรวจสอบสถานะเซิร์ฟเวอร์</li>
              <li><code>GET /api/data</code> — ค่า JSON ตัวอย่าง</li>
              <li><code>POST /login</code> — รับ JWT (username/password)</li>
              <li><code>GET /users</code> — Protected: ต้องมี JWT</li>
            </ul>

            <h4>Step-by-step</h4>
            <ol class="small">
              <li>เรียก <code>GET /ping</code> เพื่อตรวจสอบว่าเซิร์ฟเวอร์ทำงาน</li>
              <li>ถ้าต้องการข้อมูลตัวอย่าง เรียก <code>GET /api/data</code></li>
              <li>เพื่อรับ token: ส่ง <code>POST /login</code> โดย body เป็น JSON เช่น <pre id="loginExample">{"username":"your_user","password":"your_password"}</pre></li>
              <li>เซิร์ฟเวอร์จะตอบกลับ JSON ที่มีฟิลด์ <code>token</code> — คัดลอกแล้วบันทึก (localStorage หรือช่อง token ของหน้า)</li>
              <li>เรียก endpoint ที่ต้องการ JWT โดยแนบ header <code>Authorization: Bearer &lt;TOKEN&gt;</code></li>
            </ol>
          </div>

          <div class="panel">
            <h3>Examples (curl)</h3>
            <p class="small">ตัวอย่างคำสั่งพร้อมใช้งานจากเครื่องคุณ</p>

            <p class="small"><strong>Login</strong></p>
            <pre>curl -X POST ${req.protocol}://${req.get('host')}/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"your_user","password":"your_password"}'</pre>

            <p class="small"><strong>Use token to call protected endpoint</strong></p>
            <pre>curl -X GET ${req.protocol}://${req.get('host')}/users \\
  -H "Authorization: Bearer &lt;TOKEN&gt;"</pre>

            <p class="small"><strong>Example response (login)</strong></p>
            <pre>{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}</pre>
          </div>

          <div class="panel">
            <h3>Troubleshooting</h3>
            <ul class="small">
              <li>401 Unauthorized — ตรวจสอบ username/password หรือ token หมดอายุ (token มีอายุ 1 ชั่วโมง)</li>
              <li>503 / 500 — ตรวจสอบค่าใน .env (DB connection) และดู logs ที่ Vercel / server</li>
              <li>ไม่มี token ใน localStorage — บันทึก token โดยใช้ปุ่ม Save ในฝั่งขวา หรือวาง manual ใน header</li>
            </ul>
          </div>

          <div class="panel">
            <h3>Security notes</h3>
            <ul class="small">
              <li>อย่าโพสต์ token หรือ password บนที่สาธารณะ</li>
              <li>สำหรับ production ให้ใช้ HTTPS และเก็บ secret ใน environment variables</li>
              <li>ถ้าต้องการยกเลิก token ฝั่ง server ให้ implement token blacklist (ไม่รวมในตัวอย่างนี้)</li>
            </ul>
          </div>
        </div>

        <div class="right">
          <div class="panel">
            <h3>Interactive Console</h3>
            <p class="small">กรอก method / path / body แล้วกด Send</p>
            <div style="display:flex;gap:8px;margin-bottom:8px">
              <select id="method" aria-label="method"><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option></select>
              <input id="path" type="text" placeholder="/ping" value="/ping" style="flex:1"/>
            </div>
            <div style="margin-bottom:8px">
              <textarea id="body" placeholder='{"key":"value"}' style="width:100%;height:90px"></textarea>
            </div>
            <div style="display:flex;gap:8px;align-items:center">
              <button class="btn" id="send">Send</button>
              <button class="btn" id="copyCurlBtn">Copy curl</button>
            </div>

            <div style="margin-top:12px">
              <div class="small">Token (use for protected calls)</div>
              <input id="tokenInput" type="text" placeholder="paste token here" style="width:100%;margin-top:6px"/>
              <div style="display:flex;gap:8px;margin-top:8px">
                <button class="btn" id="saveToken">Save</button>
                <button class="btn" id="loadToken">Load</button>
                <button class="btn" id="clearToken">Clear</button>
              </div>
            </div>

            <div style="margin-top:12px">
              <div class="small"><strong>Response</strong></div>
              <pre id="status">Status: —</pre>
              <pre id="resp">Body / Headers: —</pre>
            </div>
          </div>

          <div class="panel small" style="margin-top:12px">
            <strong>Quick tips</strong>
            <ul>
              <li>ใช้ <code>/ping</code> ก่อนทุกครั้งเพื่อเช็ค</li>
              <li>ถ้า endpoint คืนค่า JSON หน้าเว็บจะแสดงผลสวยงาม</li>
              <li>ใช้ปุ่ม <em>Copy curl</em> เพื่อคัดลอกคำสั่งไปทดสอบบนเครื่อง</li>
            </ul>
          </div>
        </div>
      </div>

      <p class="small" style="margin-top:12px">Server: <span id="serverInfo">detecting...</span></p>
    </div>
  </div>

<script>
  const base = window.location.origin;
  document.getElementById('path').value = '/ping';

  function saveTokenToLocal(){ const v = document.getElementById('tokenInput').value.trim(); if(!v){alert('ใส่ token ก่อนกด Save'); return;} localStorage.setItem('api_token', v); alert('Token saved'); }
  function loadTokenToInput(){ const t = localStorage.getItem('api_token') || ''; document.getElementById('tokenInput').value = t; alert(t ? 'Token loaded' : 'No token found'); }
  function clearToken(){ localStorage.removeItem('api_token'); document.getElementById('tokenInput').value=''; alert('Token cleared'); }

  async function sendReq(){
    const method = document.getElementById('method').value;
    const path = document.getElementById('path').value;
    const body = document.getElementById('body').value;
    const headers = {};
    const token = localStorage.getItem('api_token');
    if(token) headers['Authorization'] = 'Bearer ' + token;
    if(body && !headers['Content-Type']) {
      try{ JSON.parse(body); headers['Content-Type']='application/json'; }catch(e){}
    }
    const url = path.startsWith('http') ? path : base + path;
    document.getElementById('status').textContent = 'Status: loading...';
    try {
      const res = await fetch(url, { method, headers, body: (method==='GET'||method==='HEAD')?undefined:body });
      const text = await res.text();
      const hdr = {}; res.headers.forEach((v,k)=> hdr[k]=v);
      document.getElementById('status').textContent = 'Status: ' + res.status + ' ' + res.statusText;
      try { document.getElementById('resp').textContent = JSON.stringify(JSON.parse(text), null, 2) + "\\n\\nHeaders:\\n" + JSON.stringify(hdr, null, 2); }
      catch(e){ document.getElementById('resp').textContent = text + "\\n\\nHeaders:\\n" + JSON.stringify(hdr, null, 2); }
    } catch(e){
      document.getElementById('status').textContent = 'Status: failed';
      document.getElementById('resp').textContent = e.message;
    }
  }

  document.getElementById('send').addEventListener('click', sendReq);
  document.getElementById('saveToken').addEventListener('click', saveTokenToLocal);
  document.getElementById('loadToken').addEventListener('click', loadTokenToInput);
  document.getElementById('clearToken').addEventListener('click', clearToken);

  document.getElementById('copyCurlBtn').addEventListener('click', ()=>{
    const method = document.getElementById('method').value;
    const path = document.getElementById('path').value;
    const body = document.getElementById('body').value;
    const url = path.startsWith('http') ? path : base + path;
    let parts = ['curl -X', method, '"' + url + '"'];
    const token = localStorage.getItem('api_token'); if(token) parts.push('-H "Authorization: Bearer ' + token.replace(/"/g,'\\"') + '"');
    if(body) parts.push("-H 'Content-Type: application/json' -d '" + body.replace(/'/g,"\\'") + "'");
    navigator.clipboard.writeText(parts.join(' ')).then(()=>alert('curl copied'));
  });

  // server info
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
