const db = require('../config/db');

exports.updateProfile = async (req, res) => {
    try {
        const { id, fullname, address, password } = req.body;
        
        // ถ้ามีการส่ง password มาใหม่ ให้เปลี่ยนด้วย (ถ้าไม่มีก็ไม่เปลี่ยน)
        let sql = 'UPDATE tbl_customers SET fullname = ?, address = ? WHERE id = ?';
        let params = [fullname, address, id];

        if (password && password.trim() !== "") {
            sql = 'UPDATE tbl_customers SET fullname = ?, address = ?, password = ? WHERE id = ?';
            params = [fullname, address, password, id];
        }

        const [result] = await db.query(sql, params);
        
        if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
        
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, fullname, address, phone_number FROM tbl_customers WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};