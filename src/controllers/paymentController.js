const Payment = require('../models/payments');

exports.getAll = async (req, res) => {
    try { const rows = await Payment.findAll(); res.json(rows); } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getById = async (req, res) => {
    try {
        const row = await Payment.findById(req.params.id);
        if (!row) return res.status(404).json({ message: 'Not found' });
        res.json(row);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
    try { const id = await Payment.create(req.body); res.status(201).json({ message: 'Created', id }); } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.update = async (req, res) => {
    try {
        const affected = await Payment.update(req.params.id, req.body);
        if (affected === 0) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.delete = async (req, res) => {
    try {
        const affected = await Payment.delete(req.params.id);
        if (affected === 0) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};