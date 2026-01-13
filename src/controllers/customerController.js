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