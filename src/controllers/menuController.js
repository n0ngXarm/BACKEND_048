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
exports.getMenuById = async (req, res) => {
    try {
        const menu = await Menu.findById(req.params.id);
        if (!menu) return res.status(404).json({ message: 'Menu not found' });
        res.json(menu);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateMenu = async (req, res) => {
    try {
        const affectedRows = await Menu.update(req.params.id, req.body);
        if (affectedRows === 0) return res.status(404).json({ message: 'Menu not found' });
        res.json({ message: 'Menu updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteMenu = async (req, res) => {
    try {
        const affectedRows = await Menu.delete(req.params.id);
        if (affectedRows === 0) return res.status(404).json({ message: 'Menu not found' });
        res.json({ message: 'Menu deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};