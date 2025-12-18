require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// --- ROUTES ---

// 1. ระบบสมาชิก (Login/Register) 
// (ยังใช้ Mock Data หรือจะแก้ให้ใช้ tbl_customers ก็ได้ในอนาคต)
app.use('/', require('./routes/users')); 

// 2. ระบบจัดการเมนูอาหาร (ดึงจาก tbl_menus)
app.use('/menus', require('./routes/menus'));

// 3. ระบบข้อมูลลูกค้า (ดึงจาก tbl_customers) [เพิ่มใหม่]
// เข้าผ่าน http://localhost:5000/customers
app.use('/customers', require('./routes/customers')); 

// (แถม) ถ้าอยากเรียกสั้นๆ ว่า /cus แบบในรูป ก็เพิ่มบรรทัดนี้ได้
app.use('/cus', require('./routes/customers'));

// --- START SERVER ---
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🍔 Menus API:     http://localhost:${PORT}/menus`);
        console.log(`👥 Customers API: http://localhost:${PORT}/customers`);
    });
}

module.exports = app;