// server.js
const app = require('./src/app'); // ชี้เข้าไปในโฟลเดอร์ src
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📄 Swagger Docs: http://localhost:${PORT}/api-docs`);
    console.log(`-----------------------------------------`);
});