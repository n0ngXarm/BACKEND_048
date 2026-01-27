const Restaurant = require('../models/restaurants');
const Customer = require('../models/customers'); // เรียกใช้ Model ลูกค้า

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
    try { 
        const { owner_id } = req.body; // ต้องส่ง owner_id มาด้วย (หรือเอาจาก req.user.id ถ้ามี middleware)
        
        if (!owner_id) return res.status(400).json({ message: 'Owner ID is required' });

        // 1. เช็คข้อมูล User
        const user = await Customer.findById(owner_id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 2. เช็คจำนวนร้านค้าที่มีอยู่
        const shopCount = await Restaurant.countByOwnerId(owner_id);

        // 3. Logic: ถ้าไม่ใช่ Plus Member และมีร้านอยู่แล้ว (Count > 0) -> Reject
        if (!user.is_plus_member && shopCount > 0) {
            return res.status(403).json({ message: 'Non-Plus members can only have 1 restaurant. Please upgrade.' });
        }

        const id = await Restaurant.create(req.body); res.status(201).json({ message: 'Created', id }); 
    } catch (err) { res.status(500).json({ error: err.message }); }
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