const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const userController = require('../controllers/userController');

// ========================================
// PUBLIC ROUTES (No authentication)
// ========================================

// Public registration request
router.post('/register', userController.registerRequest);

// ========================================
// PROTECTED ROUTES (Authentication required)
// ========================================

// All routes below require authentication
router.use(authenticateToken);

// Only project_manager can manage users
router.use(authorizeRoles('project_manager'));

// User management endpoints
router.get('/pending', userController.getPendingUsers);  // Must come before /:id routes
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// Registration approval endpoints
router.post('/:id/approve', userController.approveUser);
router.post('/:id/reject', userController.rejectUser);

module.exports = router;