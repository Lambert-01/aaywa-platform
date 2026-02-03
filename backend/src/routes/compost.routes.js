const express = require('express');
const router = express.Router();
const compostController = require('../controllers/compostController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Batches
router.post('/batches', authorizeRoles('manager', 'agronomist'), compostController.createBatch);
router.get('/batches', authorizeRoles('manager', 'agronomist'), compostController.getAllBatches);
router.get('/batches/:id', compostController.getBatchById);
router.put('/batches/:id', authorizeRoles('manager', 'agronomist'), compostController.updateBatch);

// Workdays
router.post('/workdays', authorizeRoles('manager', 'agronomist'), compostController.createWorkday);
router.get('/batches/:batchId/workdays', compostController.getWorkdaysByBatch);
router.get('/workers/:workerId/workdays', compostController.getWorkdaysByWorker);
router.put('/workdays/:id/payment', authorizeRoles('manager', 'vsla_officer'), compostController.updatePaymentStatus);

// Payments & Summary
router.get('/payments/pending', authorizeRoles('manager', 'vsla_officer'), compostController.getPendingPayments);
router.get('/summary', authorizeRoles('manager', 'agronomist'), compostController.getStipendSummary);

module.exports = router;