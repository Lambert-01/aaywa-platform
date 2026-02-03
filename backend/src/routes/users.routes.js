const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const userController = require('../controllers/userController');

// All user management routes require authentication
router.use(authenticateToken);

// Only project_manager can manage users
router.use(authorizeRoles('project_manager'));

// User management endpoints
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;