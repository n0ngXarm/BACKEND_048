const Menu = require('../models/menuModel');

// ดึงเมนูทั้งหมดของร้านที่ระบุ (เช่น ดูเมนูของร้าน ID 1)
exports.getMenusByRestaurant = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const menus = await Menu.findByRestaurantId(restaurantId);
        res.status(200).json(menus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// เพิ่มเมนูใหม่ (Admin เท่านั้น)
exports.createMenu = async (req, res) => {
    try {
        const { restaurant_id, menu_name, description, price, category } = req.body;

        // Validation
        if (!restaurant_id || !menu_name || !price) {
            return res.status(400).json({ message: 'Restaurant ID, Name, and Price are required' });
        }

        const newId = await Menu.create({ restaurant_id, menu_name, description, price, category });
        res.status(201).json({ message: 'Menu created successfully', id: newId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};