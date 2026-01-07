const app = require('./src/app');
const dotenv = require('dotenv');

dotenv.config();

const port = process.env.PORT || 5000;

// เช็คว่ารันบน Vercel หรือรันเครื่องตัวเอง
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

module.exports = app; // 👈 สำคัญมาก! ต้อง export app ออกไปให้ Vercel ใช้