const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Farmer profile (for logged-in farmer)
router.get('/me', authorizeRoles('farmer', 'champion'), farmerController.getMyProfile);

// CRUD operations
router.post('/', authorizeRoles('project_manager', 'manager', 'agronomist', 'field_facilitator'), farmerController.createFarmer);
router.get('/', authorizeRoles('project_manager', 'manager', 'agronomist', 'buyer', 'field_facilitator'), farmerController.getAllFarmers);
router.get('/cohort/:cohortId', authorizeRoles('project_manager', 'manager', 'agronomist'), farmerController.getFarmersByCohort);
router.get('/:id', farmerController.getFarmerById);
router.put('/:id', authorizeRoles('project_manager', 'manager', 'agronomist'), farmerController.updateFarmer);
router.delete('/:id', authorizeRoles('project_manager', 'manager'), farmerController.deleteFarmer);

module.exports = router;