const Menu = require('../models/menus');

exports.getAllMenus = async (req, res) => {
    try {
        const menus = await Menu.findAll();
        res.json(menus);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createMenu = async (req, res) => {
    try {
        const newId = await Menu.create(req.body);
        res.status(201).json({ message: 'Menu created', id: newId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};