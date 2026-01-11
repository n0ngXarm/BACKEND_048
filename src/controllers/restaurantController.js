const Restaurant = require('../models/restaurantModel');

// Get All Restaurants
exports.getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.findAll();
        res.status(200).json(restaurants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Single Restaurant
exports.getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
        res.status(200).json(restaurant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create Restaurant (Admin Only)
exports.createRestaurant = async (req, res) => {
    try {
        const { restaurant_name, address, phone, menu_description } = req.body;
        
        // Validation ง่ายๆ
        if (!restaurant_name || !address) {
            return res.status(400).json({ message: 'Name and Address are required' });
        }

        const newId = await Restaurant.create({ restaurant_name, address, phone, menu_description });
        res.status(201).json({ message: 'Restaurant created successfully', id: newId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};