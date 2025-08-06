const express = require('express');
const {body} = require('express-validator');
const userController = require('../controllers/userController');
const  router = express.Router();   


// Validation rules for user registration
const registerValidation = [
    body('firstName')
        .notEmpty().withMessage('First name is required')
        .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
    body('lastName')
        .notEmpty().withMessage('Last name is required')
        .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),
    body('email')
        .isEmail().withMessage('Invalid email format')
        .custom(value => {
            if (!value.endsWith('@school.edu')) {
                throw new Error('Email must end with @school.edu');
            }
            return true;
        }),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('role')
        .isIn(['student', 'teacher', 'admin']).withMessage('Role must be student, teacher, or admin'),
    body('studentId')
        .optional()
        .isString().withMessage('Student ID must be a string'),
]

// Register a new user
router.post('/register', registerValidation, userController.registerUser);

// Export the router
module.exports = router;