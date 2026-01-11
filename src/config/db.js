const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// เช็ค Connection เบื้องต้น
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database Connection Failed:', err.code);
    } else {
        console.log('✅ Connected to MySQL Database');
        connection.release();
    }
});

module.exports = pool.promise();