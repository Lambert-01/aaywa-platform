const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const searchController = require('../controllers/searchController');

// All routes require authentication
router.use(authenticateToken);

// Global search
router.get('/', searchController.globalSearch);

module.exports = router;
