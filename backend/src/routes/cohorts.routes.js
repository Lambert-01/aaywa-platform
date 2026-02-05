const express = require('express');
const router = express.Router();
const cohortController = require('../controllers/cohortController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// CRUD operations
// CRUD operations
router.post('/', authorizeRoles('project_manager', 'agronomist'), cohortController.createCohort);
router.get('/', authorizeRoles('project_manager', 'agronomist'), cohortController.getAllCohorts);
router.get('/:id', authorizeRoles('project_manager', 'agronomist'), cohortController.getCohortById);
router.put('/:id', authorizeRoles('project_manager', 'agronomist'), cohortController.updateCohort);
router.delete('/:id', authorizeRoles('project_manager'), cohortController.deleteCohort);

// [NEW] Enhanced Dashboard Endpoints
router.get('/:id/metrics', cohortController.getCohortMetrics);
router.get('/:id/farmers', cohortController.getCohortFarmers);
router.get('/:id/vsla', cohortController.getCohortVSLA);

module.exports = router;