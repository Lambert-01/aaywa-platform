const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const unifiedController = require('../controllers/unifiedController');

// All routes require authentication
router.use(authenticateToken);

// Get unified farmer profile
router.get('/farmers/:id/unified', unifiedController.getFarmerUnifiedProfile);

module.exports = router;
