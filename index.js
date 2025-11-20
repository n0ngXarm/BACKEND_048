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
// 🚪 LOGOUT (ตัวอย่าง)
// =====================
app.post('/logout', (req, res) => {
  // หมายเหตุ: ใน Node.js (Backend) ไม่มี localStorage
  // การ Logout ของ JWT คือการที่ฝั่ง Client (Frontend) ลบ Token ทิ้งเอง
  // Endpoint นี้ทำไว้เพื่อตอบกลับให้รู้ว่า Server รับทราบแล้ว (Stateless)
  res.json({ message: "Logged out successfully" });
});

// =====================
// 🔒 CRUD Users (Protected)
// =====================

app.get('/users', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, firstname, fullname, lastname, username, status FROM tbl_users');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Query failed' });
  }
});

app.get('/users/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT id, firstname, fullname, lastname, username, status FROM tbl_users WHERE id = ?', [id]);
    if (rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
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

app.put('/users/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { firstname, fullname, lastname, username, password, status } = req.body;

  try {
    let query = `UPDATE tbl_users SET firstname = ?, fullname = ?, lastname = ?, username = ?, status = ?`;
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

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
});

app.delete('/users/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM tbl_users WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
    }

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
// Simple API Console (Enhanced Version)
// -------------------------
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>API Console - Pisitpong_BACKEND_048</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --bg-color: #0f172a;
    --card-bg: #1e293b;
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --accent: #38bdf8;
    --accent-hover: #0ea5e9;
    --border: #334155;
    --code-bg: #020617;
    --success: #22c55e;
    --error: #ef4444;
    --warning: #f59e0b;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: 'Inter', system-ui, sans-serif;
    background: var(--bg-color);
    color: var(--text-primary);
    line-height: 1.6;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    width: 100%;
    flex: 1;
  }
  header {
    margin-bottom: 2rem;
    border-bottom: 1px solid var(--border);
    padding-bottom: 1rem;
  }
  h1 { margin: 0; font-size: 1.5rem; font-weight: 600; color: var(--accent); }
  .subtitle { color: var(--text-secondary); font-size: 0.9rem; }
  
  .grid {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 2rem;
  }
  
  .card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  h2 { font-size: 1.1rem; margin-top: 0; border-left: 3px solid var(--accent); padding-left: 10px; }
  
  /* Form Elements */
  .control-group { margin-bottom: 1rem; }
  label { display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem; }
  input, select, textarea {
    width: 100%;
    padding: 0.75rem;
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-primary);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9rem;
    transition: border-color 0.2s;
  }
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: var(--accent);
  }
  
  .row { display: flex; gap: 0.5rem; }
  .btn {
    padding: 0.75rem 1.5rem;
    background: var(--accent);
    color: #0f172a;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn:hover { background: var(--accent-hover); transform: translateY(-1px); }
  .btn.outline { background: transparent; border: 1px solid var(--border); color: var(--text-secondary); }
  .btn.outline:hover { border-color: var(--text-primary); color: var(--text-primary); }
  
  /* Response Area */
  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 99px;
    font-size: 0.8rem;
    font-weight: 600;
    background: var(--border);
    margin-bottom: 1rem;
  }
  .status-badge.success { background: rgba(34, 197, 94, 0.2); color: var(--success); }
  .status-badge.error { background: rgba(239, 68, 68, 0.2); color: var(--error); }
  
  pre {
    background: var(--code-bg);
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85rem;
    border: 1px solid var(--border);
    max-height: 400px;
  }
  
  /* List Styles */
  ul.endpoints { list-style: none; padding: 0; margin: 0; }
  ul.endpoints li {
    padding: 0.75rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: background 0.2s;
  }
  ul.endpoints li:hover { background: rgba(255,255,255,0.03); }
  ul.endpoints li:last-child { border-bottom: none; }
  .method {
    font-size: 0.7rem;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 4px;
    min-width: 50px;
    text-align: center;
  }
  .GET { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
  .POST { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
  .PUT { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
  .DELETE { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
  
  .tip-box {
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid var(--warning);
    color: var(--warning);
    padding: 10px;
    border-radius: 6px;
    font-size: 0.85rem;
    margin-top: 1rem;
  }

  @media (max-width: 800px) {
    .grid { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🚀 API Console <span style="font-weight:300; color:var(--text-secondary)">| Pisitpong_BACKEND_048</span></h1>
      <div class="subtitle">สถานะเซิร์ฟเวอร์: <span id="serverInfo">กำลังตรวจสอบ...</span></div>
    </header>

    <div class="grid">
      <!-- Left Column: Controls & Response -->
      <div class="main-content">
        <div class="card">
          <h2>Request Tester</h2>
          <div class="control-group">
            <div class="row">
              <select id="method" style="width: 120px;">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
              <input id="path" type="text" value="/ping" placeholder="/api/endpoint">
              <button id="send" class="btn">Send Request</button>
            </div>
          </div>
          
          <div class="control-group">
            <label>Request Body (JSON)</label>
            <textarea id="body" rows="5" placeholder='{ "key": "value" }'></textarea>
          </div>

          <div class="control-group">
            <div class="row" style="justify-content: space-between; align-items: center;">
               <label style="margin:0">Authorization Token</label>
               <div class="row" style="gap:5px">
                 <button id="saveToken" class="btn outline" style="padding:4px 8px; font-size:0.75rem">Save</button>
                 <button id="loadToken" class="btn outline" style="padding:4px 8px; font-size:0.75rem">Load</button>
                 <button id="clearToken" class="btn outline" style="padding:4px 8px; font-size:0.75rem">Clear</button>
               </div>
            </div>
            <input id="tokenInput" type="text" placeholder="Bearer Token...">
            <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:5px">Token จะถูกใส่ให้เองอัตโนมัติถ้า Login สำเร็จ</div>
          </div>
        </div>

        <div class="card" style="margin-top: 2rem;">
           <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem">
              <h2>Response</h2>
              <div id="status" class="status-badge">Ready</div>
           </div>
           <pre id="resp">// ผลลัพธ์จะแสดงที่นี่...</pre>
           <button id="copyCurlBtn" class="btn outline" style="width:100%; margin-top:1rem">Copy as cURL</button>
        </div>
      </div>

      <!-- Right Column: Documentation/Quick Links -->
      <div class="sidebar">
        <div class="card">
          <h2>📍 ทางลัด (Quick Links)</h2>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:1rem">คลิกรายการด้านล่างเพื่อโหลดคำสั่งทันที:</p>
          <ul class="endpoints">
            <li onclick="setReq('GET', '/ping')"><span class="method GET">GET</span> /ping <span style="font-size:0.7rem; color:#666; margin-left:auto">เช็คเซิร์ฟเวอร์</span></li>
            <li onclick="setReq('GET', '/api/data')"><span class="method GET">GET</span> /api/data <span style="font-size:0.7rem; color:#666; margin-left:auto">ข้อมูลตัวอย่าง</span></li>
            <li onclick="setReq('POST', '/login', '{\\n  &quot;username&quot;: &quot;user1&quot;,\\n  &quot;password&quot;: &quot;1234&quot;\\n}')"><span class="method POST">POST</span> /login <span style="font-size:0.7rem; color:#666; margin-left:auto">เข้าสู่ระบบ</span></li>
            <li onclick="setReq('POST', '/logout')"><span class="method POST">POST</span> /logout <span style="font-size:0.7rem; color:#666; margin-left:auto">ออกจากระบบ</span></li>
            <li onclick="setReq('GET', '/users')"><span class="method GET">GET</span> /users (Protected) <span style="font-size:0.7rem; color:#666; margin-left:auto">ดึงข้อมูลทั้งหมด</span></li>
            <li onclick="setReq('POST', '/users', '{\\n  &quot;firstname&quot;: &quot;John&quot;,\\n  &quot;fullname&quot;: &quot;John Doe&quot;,\\n  &quot;lastname&quot;: &quot;Doe&quot;,\\n  &quot;username&quot;: &quot;johnd&quot;,\\n  &quot;password&quot;: &quot;pass1234&quot;,\\n  &quot;status&quot;: &quot;active&quot;\\n}')"><span class="method POST">POST</span> /users <span style="font-size:0.7rem; color:#666; margin-left:auto">เพิ่มผู้ใช้</span></li>
            
            <!-- ✅ เพิ่มปุ่ม DELETE ตรงนี้ (บรรทัดใหม่) -->
            <li onclick="deleteUserPrompt()"><span class="method DELETE">DELETE</span> /users/:id <span style="font-size:0.7rem; color:#666; margin-left:auto">ลบผู้ใช้ (ระบุ ID)</span></li>
          </ul>
        </div>

        <div class="card" style="margin-top: 2rem; background: rgba(6, 182, 212, 0.05); border-color: var(--accent);">
          <h2 style="border-color: var(--accent)">💡 วิธีใช้งาน (How to use)</h2>
          <ol style="font-size: 0.9rem; padding-left: 1.2rem; color: var(--text-primary); margin-bottom:0">
            <li><b>เริ่มที่ /ping:</b> กดส่ง <code>GET /ping</code> เพื่อดูว่าเชื่อมต่อได้ไหม (ต้องได้ Status 200 OK)</li>
            <li><b>Login รับ Token:</b> ใช้ <code>POST /login</code> เซิร์ฟเวอร์จะคืน Token มาให้</li>
            <li><b>Auto-Save:</b> ระบบจะดูด Token เข้าช่อง Authorization ให้เอง (หรือกด Save เก็บไว้ใช้ครั้งหน้า)</li>
            <li><b>ทดสอบ API ลับ:</b> ลองกด <code>GET /users</code> ซึ่งต้องใช้ Token ถึงจะผ่าน</li>
          </ol>
        </div>
        
        <div class="card" style="margin-top: 2rem; border-color: var(--warning);">
          <h2 style="border-color: var(--warning); color: var(--warning)">⚠️ ปัญหาที่พบบ่อย</h2>
          <div style="font-size: 0.85rem; color: var(--text-secondary);">
             <p style="margin-bottom:8px"><b>1. หมุนติ้วๆ ไม่หยุด (Loading...):</b><br>
             แปลว่าเซิร์ฟเวอร์ทำงานแต่ <u>ลืมตอบกลับ</u> ให้เช็คโค้ดว่ามี <code>res.json(...)</code> หรือ <code>res.send(...)</code> หรือยัง</p>
             
             <p style="margin-bottom:8px"><b>2. 401 Unauthorized:</b><br>
             แปลว่า <u>Token ผิด/หมดอายุ</u> ให้ลอง Login ใหม่แล้วกด Save Token อีกรอบ</p>
             
             <p style="margin-bottom:0"><b>3. Connection Refused:</b><br>
             แปลว่า <u>ผิด Port</u> เช็คว่าเซิร์ฟเวอร์รันที่ Port ไหน (ดูใน Terminal) แล้วแก้ URL ให้ตรง</p>
          </div>
        </div>
      </div>
    </div>
  </div>

<script>
  const base = window.location.origin;
  
  function setReq(method, path, body = '') {
    document.getElementById('method').value = method;
    document.getElementById('path').value = path;
    if(body) document.getElementById('body').value = body;
  }

  // ✅ เพิ่มฟังก์ชันสำหรับปุ่ม DELETE (บรรทัดใหม่)
  function deleteUserPrompt() {
    const id = prompt("ระบุ ID ผู้ใช้ที่ต้องการลบ (เช่น 1, 5, 10):", "");
    if(id) setReq('DELETE', '/users/' + id.trim());
  }

  function saveTokenToLocal(){ const v = document.getElementById('tokenInput').value.trim(); if(!v){alert('ระบุ Token ก่อนครับ'); return;} localStorage.setItem('api_token', v); alert('บันทึก Token แล้ว'); }
  function loadTokenToInput(){ const t = localStorage.getItem('api_token') || ''; document.getElementById('tokenInput').value = t; if(t) alert('โหลด Token แล้ว'); else alert('ไม่พบ Token ที่บันทึกไว้'); }
  function clearToken(){ localStorage.removeItem('api_token'); document.getElementById('tokenInput').value=''; alert('ลบ Token แล้ว'); }

  async function sendReq(){
    const method = document.getElementById('method').value;
    const path = document.getElementById('path').value;
    const body = document.getElementById('body').value;
    const headers = {};
    const token = document.getElementById('tokenInput').value || localStorage.getItem('api_token'); // Read from input first
    
    if(token) headers['Authorization'] = 'Bearer ' + token.replace('Bearer ', '');
    
    if(body && !headers['Content-Type']) {
      try{ JSON.parse(body); headers['Content-Type']='application/json'; }catch(e){}
    }
    
    const url = path.startsWith('http') ? path : base + path;
    
    const statusEl = document.getElementById('status');
    statusEl.textContent = 'Sending...';
    statusEl.className = 'status-badge';
    statusEl.style.background = '#fbbf24'; statusEl.style.color = '#000';

    try {
      const res = await fetch(url, { method, headers, body: (method==='GET'||method==='HEAD')?undefined:body });
      const text = await res.text();
      
      statusEl.textContent = res.status + ' ' + res.statusText;
      statusEl.className = 'status-badge ' + (res.ok ? 'success' : 'error');
      statusEl.style.background = ''; statusEl.style.color = '';

      let display = '';
      try { 
         const json = JSON.parse(text);
         display = JSON.stringify(json, null, 2);
         
         // Auto-fill token if login success
         if(path.includes('/login') && json.token) {
             document.getElementById('tokenInput').value = json.token;
             localStorage.setItem('api_token', json.token);
             display += '\\n\\n✨ Auto-saved token to localStorage! (บันทึก Token ให้แล้ว)';
         }
         
         // Special handling for Logout: Clear frontend token
         if(path.includes('/logout')) {
            document.getElementById('tokenInput').value = '';
            localStorage.removeItem('api_token');
            display += '\\n\\n🧹 Cleared frontend token successfully!';
         }

      } catch(e){ display = text; }
      
      document.getElementById('resp').textContent = display;
      
    } catch(e){
      statusEl.textContent = 'Error';
      statusEl.className = 'status-badge error';
      document.getElementById('resp').textContent = 'Failed to fetch: ' + e.message;
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
    const token = document.getElementById('tokenInput').value; 
    if(token) parts.push('-H "Authorization: Bearer ' + token + '"');
    if(body) parts.push("-H 'Content-Type: application/json' -d '" + body.replace(/'/g,"\\'") + "'");
    navigator.clipboard.writeText(parts.join(' ')).then(()=>alert('Copied cURL command!'));
  });

  // Check server status
  (async ()=>{
    try {
      const r = await fetch(base + '/ping');
      const j = await r.json();
      const el = document.getElementById('serverInfo');
      el.textContent = 'ออนไลน์ ✅ (' + (j.time||'') + ')';
      el.style.color = '#22c55e';
    } catch(e){
      const el = document.getElementById('serverInfo');
      el.textContent = 'ไม่สามารถเชื่อมต่อได้ ❌';
      el.style.color = '#ef4444';
    }
  })();
  
  // Initial load token
  loadTokenToInput();
</script>
</body>
</html>`);
});