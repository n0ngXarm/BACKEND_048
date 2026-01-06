const { validateOrder } = require('../utils/validators');

exports.getAllOrders = async (req, res, next) => {
	try {
		// ...existing code...
		res.json([]); // placeholder
	} catch (err) { next(err); }
};

exports.getOrderById = async (req, res, next) => {
	try {
		const id = Number(req.params.id);
		// ...existing code...
		res.json({ id, customerId: 1, items: [] });
	} catch (err) { next(err); }
};

exports.createOrder = async (req, res, next) => {
	try {
		const { valid, errors } = validateOrder(req.body);
		if (!valid) return res.status(400).json({ errors });
		// ...existing code...
		res.status(201).json({ id: 1, ...req.body });
	} catch (err) { next(err); }
};

exports.updateOrder = async (req, res, next) => {
	try {
		const id = Number(req.params.id);
		// ...existing code...
		res.json({ id, ...req.body });
	} catch (err) { next(err); }
};

exports.deleteOrder = async (req, res, next) => {
	try {
		const id = Number(req.params.id);
		// ...existing code...
		res.json({ message: 'Order deleted', id });
	} catch (err) { next(err); }
};