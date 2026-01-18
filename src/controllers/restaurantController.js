const Restaurant = require('../models/restaurants');

exports.getAll = async (req, res) => {
    try { const rows = await Restaurant.findAll(); res.json(rows); } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getById = async (req, res) => {
    try {
        const row = await Restaurant.findById(req.params.id);
        if (!row) return res.status(404).json({ message: 'Not found' });
        res.json(row);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
    try { const id = await Restaurant.create(req.body); res.status(201).json({ message: 'Created', id }); } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.update = async (req, res) => {
    try {
        console.log("🛠️ 6. Controller: กำลังจะอัปเดตข้อมูล...");
        console.log("   - Body:", req.body); // ดูว่าชื่อไฟล์ (image_url) ถูกยัดกลับเข้ามาไหม

        const affected = await Restaurant.update(req.params.id, req.body);
        
        if (affected === 0) {
            console.warn("⚠️ 7. Database: ไม่มีแถวไหนถูกแก้ไขเลย (ID ผิดป่าว?)");
            return res.status(404).json({ message: 'Update failed or No changes' });
        }

        console.log("✅ 8. Success: บันทึกข้อมูลเรียบร้อย!");
        res.json({ message: 'Updated successfully' });

    } catch (err) { 
        // 🔥 [จุดตายสุดท้าย] Database Error
        console.error("🔥 9. Database Error:", err.message); 
        console.error(err); // ปริ้นท์ error ตัวเต็มออกมา
        res.status(500).json({ error: err.message }); 
    }
};

exports.delete = async (req, res) => {
    try {
        const affected = await Restaurant.delete(req.params.id);
        if (affected === 0) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};