const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Farmer profile (for logged-in farmer)
router.get('/me', authorizeRoles('farmer', 'champion'), farmerController.getMyProfile);

// Farmer-specific mobile endpoints
router.get('/me/trust-score', authorizeRoles('farmer', 'champion'), farmerController.getTrustScore);
router.get('/me/learning-path', authorizeRoles('farmer', 'champion'), farmerController.getLearningPath);
router.get('/me/market-intel', authorizeRoles('farmer', 'champion'), farmerController.getMarketIntel);
router.get('/me/resource-qualification', authorizeRoles('farmer', 'champion'), farmerController.getResourceQualification);

// CRUD operations
// CRUD operations
router.post('/batch', authorizeRoles('project_manager', 'agronomist', 'field_facilitator'), farmerController.createBatchFarmers);
router.post('/', authorizeRoles('project_manager', 'agronomist', 'field_facilitator'), farmerController.createFarmer);
router.get('/', authorizeRoles('project_manager', 'agronomist', 'field_facilitator'), farmerController.getAllFarmers);
router.get('/cohort/:cohortId', authorizeRoles('project_manager', 'agronomist'), farmerController.getFarmersByCohort);
router.get('/:id/profile', authorizeRoles('project_manager', 'agronomist', 'field_facilitator'), farmerController.getFarmerProfileById);
router.get('/:id', authorizeRoles('project_manager', 'agronomist', 'field_facilitator'), farmerController.getFarmerById);
router.put('/:id', authorizeRoles('project_manager', 'agronomist'), farmerController.updateFarmer);
router.delete('/:id', authorizeRoles('project_manager'), farmerController.deleteFarmer);

module.exports = router;