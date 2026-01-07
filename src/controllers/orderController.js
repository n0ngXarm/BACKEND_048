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
// ... (เพิ่มต่อท้าย - ใช้ Pattern เดียวกับ Customers/Menus เลยครับ)
exports.getOrderById = async (req, res) => {
    /* ...Logic หา ID... */ 
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateOrder = async (req, res) => {
    /* ...Logic Update... */
    try {
        const affectedRows = await Order.update(req.params.id, req.body);
        if (affectedRows === 0) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order status updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteOrder = async (req, res) => {
    /* ...Logic Delete... */
    try {
        const affectedRows = await Order.delete(req.params.id);
        if (affectedRows === 0) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};