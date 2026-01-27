# [Backend_048]

ระบบ Backend_048 พัฒนาด้วย Node.js และ Express สำหรับจัดการ 

## 🛠 Features (คุณสมบัติ)
- **Authentication:** มีระบบ Middleware ตรวจสอบสิทธิ์ (Auth)
- **Integration Tests:** รองรับการทดสอบระบบ
- **Vercel Deployment:** รองรับการ Deploy ผ่าน Vercel
- /middleware - เก็บไฟล์ Middleware (เช่น auth.js)
- /public - ไฟล์ Static assets
- /tests - ไฟล์สำหรับการทดสอบระบบ

## 🚀 Getting Started (วิธีเริ่มใช้งาน)

### Prerequisites (สิ่งที่ต้องมี)
- Node.js (v14 ขึ้นไป)
- npm

### Installation (การติดตั้ง)
1. Clone repository นี้ลงมา
2. ติดตั้ง dependencies:
   ```bash
   npm install

## Configuration (การตั้งค่า)
PORT=3000
# ใส่ค่าอื่นๆ ที่จำเป็น เช่น Database URL หรือ JWT Secret

## Running the App (การรันโปรแกรม)
node index.js
# หรือถ้าตั้ง script ไว้ใน package.json
npm start

## 🌐 Live Demo (ทดลองใช้งาน)
สามารถเข้าดูผลลัพธ์การทำงานของ API จริงได้ที่ลิงก์นี้:

- **Base URL:** [https://backend048.vercel.app](https://backend048.vercel.app)
- **Get Menus:** [https://backend048.vercel.app/menus](https://backend048.vercel.app/menus) *(คลิกเพื่อดูรายการเมนู)*

---
## 🔐 Authentication API

### 1. Login (เข้าสู่ระบบ)
- **Endpoint:** `POST /login`
- **Response:**
  ```json
  {
    "user": { "id": 1, "username": "user" },
    "accessToken": "...",
    "refreshToken": "..."
  }
  ```

### 2. Refresh Token (ต่ออายุ Token)
- **Endpoint:** `POST /auth/refresh`
- **Body:** `{ "refreshToken": "..." }`
- **Response:**
  ```json
  {
    "accessToken": "...",
    "refreshToken": "..."
  }
  ```

### 📝 Example Response (ตัวอย่างผลลัพธ์)
เมื่อเรียกข้อมูลจาก `/menus` ระบบจะส่งค่ากลับมาเป็น JSON ดังนี้:

```json
[
  {
    "id": 1,
    "name": "Cappuccino",
    "price": 55,
    "category": "Coffee"
  },
  {
    "id": 2,
    "name": "Green Tea",
    "price": 45,
    "category": "Tea"
  }
]