const cors = require('cors');
const app = require('./src/app');
const dotenv = require('dotenv');

dotenv.config();

app.use(cors({
    origin: 'http://localhost:5173', // หรือ '*' เพื่ออนุญาตทั้งหมด (ไม่แนะนำสำหรับ Production)
    credentials: true
}));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
});