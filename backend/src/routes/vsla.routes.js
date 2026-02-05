const express = require('express');
const router = express.Router();
const vslaController = require('../controllers/vslaController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// VSLA groups
router.post('/', authorizeRoles('project_manager', 'agronomist'), vslaController.createVSLA);
router.get('/', authorizeRoles('project_manager', 'field_facilitator'), vslaController.getAllVSLAs);
router.get('/cohort/:cohortId', vslaController.getVSLAsByCohort);
router.get('/:id', vslaController.getVSLAById); // Now returns metrics too
router.get('/:id/metrics', vslaController.getVSLAMetrics); // Explicit metrics endpoint

router.put('/:id', authorizeRoles('project_manager', 'agronomist'), vslaController.updateVSLA);
router.delete('/:id', authorizeRoles('project_manager'), vslaController.deleteVSLA);

// Members & Officers
router.post('/:id/members', authorizeRoles('project_manager', 'field_facilitator'), vslaController.addMember);
router.get('/:id/members', vslaController.getMembers);
router.get('/:id/members/financial', vslaController.getMemberFinancialSummary);
router.get('/:id/officers', vslaController.getOfficers);
router.put('/:id/officers', authorizeRoles('project_manager', 'field_facilitator'), vslaController.rotateOfficer); // Rotate officers

// Transactions
router.post('/:id/transactions', authorizeRoles('project_manager', 'field_facilitator'), vslaController.createTransaction);
router.get('/:id/transactions', vslaController.getTransactions);
router.get('/:id/balance', vslaController.getBalance);

// Quick Actions
router.post('/:id/statements/generate', authorizeRoles('project_manager', 'field_facilitator'), vslaController.generateStatements);
router.post('/:id/summary/email', authorizeRoles('project_manager', 'field_facilitator'), vslaController.sendWeeklySummary);
router.put('/:id/settings', authorizeRoles('project_manager', 'field_facilitator'), vslaController.updateSettings);

module.exports = router;