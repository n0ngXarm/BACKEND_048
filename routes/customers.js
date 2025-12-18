const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /customers -> ดึงรายชื่อลูกค้าทั้งหมด
router.get('/', (req, res) => {
    // ชื่อตารางตามภาพที่คุณส่งมา
    const sql = 'SELECT * FROM tbl_customers';
    
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// (Optional) GET /customers/:id -> ดึงลูกค้าตาม ID
router.get('/:id', (req, res) => {
    // เดาว่า Primary Key น่าจะชื่อ customer_id หรือ id (ต้องเช็คใน DB อีกที)
    const sql = 'SELECT * FROM tbl_customers WHERE customer_id = ?';
    
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Customer not found' });
        res.json(results[0]);
    });
});

module.exports = router;