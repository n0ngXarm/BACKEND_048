const Customer = require('../models/customers');

exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.findAll();
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createCustomer = async (req, res) => {
    try {
        const newId = await Customer.create(req.body);
        res.status(201).json({ message: 'Customer created', id: newId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const affectedRows = await Customer.update(req.params.id, req.body);
        if (affectedRows === 0) return res.status(404).json({ message: 'Customer not found' });
        res.json({ message: 'Customer updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const affectedRows = await Customer.delete(req.params.id);
        if (affectedRows === 0) return res.status(404).json({ message: 'Customer not found' });
        res.json({ message: 'Customer deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.update = async (req, res) => {
    try {
        // 🔍 เพิ่มบรรทัดนี้เพื่อดูค่าที่ส่งมา
        console.log("Update Data Recieved:", req.body); 

        const affected = await Restaurant.update(req.params.id, req.body);
        if (affected === 0) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Updated' });
    } catch (err) { 
        console.error(err); // 🔍 ให้มันฟ้อง Error ออกมา
        res.status(500).json({ error: err.message }); 
    }
};
exports.create = async (req, res) => {
    try {
        // 🔍 ดูว่า Frontend ส่ง image_url มาไหม และยาวแค่ไหน
        if (req.body.image_url) {
            console.log("✅ Received Image! Length:", req.body.image_url.length);
            console.log("Start of Image:", req.body.image_url.substring(0, 50)); 
        } else {
            console.log("❌ No image_url received!");
        }

        const id = await Restaurant.create(req.body);
        res.status(201).json({ message: 'Created', id });
    } catch (err) {
        console.error("🔥 Error:", err.message); // ดู Error ในจอดำ
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        // 🔍 เพิ่มเหมือนกันตอน Update
        console.log("🔄 Updating Shop ID:", req.params.id);
        if (req.body.image_url) {
            console.log("✅ Received Image! Length:", req.body.image_url.length);
        }

        const affected = await Restaurant.update(req.params.id, req.body);
        if (affected === 0) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Updated' });
    } catch (err) {
        console.error("🔥 Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};