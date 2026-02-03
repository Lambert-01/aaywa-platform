const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
    validateRegistration,
    validateLogin,
    validateChangePassword,
    validateUpdateProfile
} = require('../middleware/validation.middleware');
const {
    registrationLimiter
} = require('../middleware/rateLimit.middleware');

/**
 * Authentication Routes
 * Handles user registration, OTP-based login, and profile management
 */

// Public routes (no authentication required)

/**
 * @route   POST /api/auth/register
 * @desc    Register new user (admin/PM only)
 * @access  Private (Project Manager)
 */
router.post(
    '/register',
    authenticateToken,
    authorizeRoles('project_manager'),
    registrationLimiter,
    validateRegistration,
    authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user with email and password
 * @access  Public
 */
router.post(
    '/login',
    validateLogin,
    authController.login
);


// Protected routes (require authentication)

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticateToken, authController.getMe);

/**
 * @route   PATCH /api/auth/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.patch(
    '/profile',
    authenticateToken,
    validateUpdateProfile,
    authController.updateProfile
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post(
    '/change-password',
    authenticateToken,
    validateChangePassword,
    authController.changePassword
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal + server-side logging)
 * @access  Private
 */
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
