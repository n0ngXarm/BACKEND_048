const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /menus -> ดึงรายการอาหารทั้งหมด
router.get('/', (req, res) => {
    // ชื่อตารางต้องตรงกับใน Database จริง (tbl_menus)
    const sql = 'SELECT * FROM tbl_menus';
    
    if (db.state === 'disconnected') {
        return res.status(503).json({ error: 'Database service unavailable' });
    }

    db.query(sql, (err, results) => {
        if (err) {
            console.error('SQL Error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

module.exports = router;