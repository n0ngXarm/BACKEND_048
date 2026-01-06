// src/controllers/menuController.js
const Menu = require('../models/menus');

exports.getAllMenus = async (req, res) => {
    try {
        const menus = await Menu.findAll();
        res.status(200).json({
            success: true,
            data: menus
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getMenuById = async (req, res) => {
    try {
        const menu = await Menu.findById(req.params.id);
        if (!menu) {
            return res.status(404).json({ success: false, message: 'Menu not found' });
        }
        res.status(200).json({ success: true, data: menu });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.createMenu = async (req, res) => {
    try {
        // req.body คือข้อมูลที่ส่งมาจาก Frontend
        const newMenuId = await Menu.create(req.body);
        res.status(201).json({ 
            success: true, 
            message: 'Menu created', 
            id: newMenuId 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error creating menu' });
    }
};