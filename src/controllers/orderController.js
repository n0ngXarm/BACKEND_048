const Order = require('../models/orders');

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const newId = await Order.create(req.body);
        res.status(201).json({ message: 'Order created', id: newId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};