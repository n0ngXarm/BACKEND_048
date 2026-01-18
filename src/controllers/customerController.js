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