module.exports = {
	// Validate user/customer payload
	validateUser(body = {}) {
		const errors = [];
		if (!body.username || typeof body.username !== 'string') errors.push('username is required and must be a string');
		if (!body.password || typeof body.password !== 'string') errors.push('password is required and must be a string');
		if (!body.firstname || typeof body.firstname !== 'string') errors.push('firstname is required and must be a string');
		if (!body.lastname || typeof body.lastname !== 'string') errors.push('lastname is required and must be a string');
		return { valid: errors.length === 0, errors };
	},

	// Validate order payload (simple example)
	validateOrder(body = {}) {
		const errors = [];
		if (!body.customerId || typeof body.customerId !== 'number') errors.push('customerId is required and must be a number');
		if (!Array.isArray(body.items) || body.items.length === 0) errors.push('items is required and must be a non-empty array');
		return { valid: errors.length === 0, errors };
	}
};
