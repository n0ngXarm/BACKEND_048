const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

router.get('/', menuController.getAllMenus);
router.post('/', menuController.createMenu);
// router.get('/:id', menuController.getMenuById); // ถ้าทำเพิ่มแล้วค่อยเปิด

module.exports = router;