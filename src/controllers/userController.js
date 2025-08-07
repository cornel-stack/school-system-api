const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {validationResult} = require('express-validator');
const User = require('../models/user');

// Helper to generate JWT token
const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
}

//Register a new user

exports.registerUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {    
            return res.status(400).json({ errors: errors.array() });
        }

        const { firstName, lastName, email, password, role, studentId } = req.body;

        //check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const user = new User({
            firstName,
            lastName,
            email,
            password,
            role,
            studentId: role === 'student' ? studentId : undefined
        }); 

        await user.save();

        const token = generateToken(user);
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

//Login a user
exports.loginUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bycrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = generateToken(user);
        res.status(200).json({
            message: 'Login successful',
            user: { 
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// Get User by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        //Handle field limiting
        const fields = req.query.fields ? req.query.fields.split(',').reduce((obj, field) => {
            if (field === "name") {
                field = "fullName";
            }   
            return obj;
        }, {}) : null;

        const result = fields ? await User.findById(req.params.id).select(fields) : user;

        res.json(result)
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}