const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Farmer profile (for logged-in farmer)
router.get('/me', authorizeRoles('farmer', 'champion'), farmerController.getMyProfile);

// CRUD operations
// CRUD operations
router.post('/', authorizeRoles('project_manager', 'agronomist', 'field_facilitator'), farmerController.createFarmer);
router.get('/', authorizeRoles('project_manager', 'agronomist', 'field_facilitator'), farmerController.getAllFarmers);
router.get('/cohort/:cohortId', authorizeRoles('project_manager', 'agronomist'), farmerController.getFarmersByCohort);
router.get('/:id', authorizeRoles('project_manager', 'agronomist', 'field_facilitator'), farmerController.getFarmerById);
router.put('/:id', authorizeRoles('project_manager', 'agronomist'), farmerController.updateFarmer);
router.delete('/:id', authorizeRoles('project_manager'), farmerController.deleteFarmer);

module.exports = router;