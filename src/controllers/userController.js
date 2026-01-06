const User = require('../models/users');
const bcrypt = require('bcrypt');

// GET All Users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET User By ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST Create User
exports.createUser = async (req, res) => {
    try {
        const { firstname, fullname, lastname, username, password, status } = req.body;
        if (!password) return res.status(400).json({ error: 'Password is required' });

        // Hash Password ตามโจทย์
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUserId = await User.create({
            firstname, fullname, lastname, username, 
            password: hashedPassword, 
            status
        });

        res.status(201).json({ 
            message: "User created successfully",
            id: newUserId,
            firstname, fullname, lastname, username, status 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT Update User
exports.updateUser = async (req, res) => {
    try {
        const { firstname, fullname, lastname, password } = req.body;
        let hashedPassword = null;
        
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const affectedRows = await User.update(req.params.id, {
            firstname, fullname, lastname, 
            password: hashedPassword
        });

        if (affectedRows === 0) return res.status(404).json({ message: 'User not found or no changes made' });
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE User
exports.deleteUser = async (req, res) => {
    try {
        const affectedRows = await User.delete(req.params.id);
        if (affectedRows === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};