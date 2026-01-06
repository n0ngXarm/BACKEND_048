const { validateUser } = require('../utils/validators');

exports.getAllCustomers = async (req, res, next) => {
	try {
		// ...existing code...
		res.json([]); // placeholder: return empty list
	} catch (err) { next(err); }
};

exports.getCustomerById = async (req, res, next) => {
	try {
		const id = Number(req.params.id);
		// ...existing code...
		res.json({ id, username: 'sample', firstname: 'First', lastname: 'Last' });
	} catch (err) { next(err); }
};

exports.createCustomer = async (req, res, next) => {
	try {
		const { valid, errors } = validateUser(req.body);
		if (!valid) return res.status(400).json({ errors });
		// ...existing code...
		res.status(201).json({ id: 1, ...req.body });
	} catch (err) { next(err); }
};

exports.updateCustomer = async (req, res, next) => {
	try {
		const id = Number(req.params.id);
		// ...existing code...
		res.json({ id, ...req.body });
	} catch (err) { next(err); }
};

exports.deleteCustomer = async (req, res, next) => {
	try {
		const id = Number(req.params.id);
		// ...existing code...
		res.json({ message: 'Customer deleted', id });
	} catch (err) { next(err); }
};