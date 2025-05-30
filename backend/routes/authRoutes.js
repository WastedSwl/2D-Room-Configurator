const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authController.register);

// @route   POST api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', authController.login);

// @route   GET api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;