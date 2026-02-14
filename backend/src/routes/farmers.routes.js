const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes require authentication
router.use(authenticateToken);

// Farmer profile (for logged-in farmer)
router.get('/me', authorizeRoles('farmer', 'champion'), farmerController.getMyProfile);

// Farmer-specific mobile endpoints
router.get('/me/trust-score', authorizeRoles('farmer', 'champion'), farmerController.getTrustScore);
router.get('/me/learning-path', authorizeRoles('farmer', 'champion'), farmerController.getLearningPath);
router.get('/me/market-intel', authorizeRoles('farmer', 'champion'), farmerController.getMarketIntel);
router.get('/me/resource-qualification', authorizeRoles('farmer', 'champion'), farmerController.getResourceQualification);

// Image uploading
router.post('/upload-photo', authorizeRoles('farmer', 'champion', 'field_facilitator', 'agronomist', 'project_manager'), upload.single('photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const filePath = `uploads/farmers/${req.file.filename}`;
    res.json({
        message: 'Photo uploaded successfully',
        url: filePath
    });
});

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