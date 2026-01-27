const Menu = require('../models/menus');
const Restaurant = require('../models/restaurants');
const Customer = require('../models/customers');

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
        const { restaurant_id } = req.body;

        // 1. หาข้อมูลร้านค้าเพื่อดูว่าใครเป็นเจ้าของ
        const restaurant = await Restaurant.findById(restaurant_id);
        if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

        // 2. หาข้อมูลเจ้าของร้าน
        const owner = await Customer.findById(restaurant.owner_id);
        
        // 3. นับจำนวนเมนูที่มีอยู่
        const menuCount = await Menu.countByRestaurantId(restaurant_id);

        // 4. Logic: ถ้าเมนูครบ 10 และเจ้าของไม่ใช่ Plus Member -> Reject
        if (menuCount >= 10 && owner && !owner.is_plus_member) {
            return res.status(403).json({ message: 'Menu limit reached (10). Upgrade to Plus for unlimited menus.' });
        }

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