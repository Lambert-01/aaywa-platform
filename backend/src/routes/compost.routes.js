const express = require('express');
const router = express.Router();
const compostController = require('../controllers/compostController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Batches
// Enhanced batch listing with full details (NEW) - MUST be before /batches/:id
router.get('/batches/detailed', compostController.getAllBatchesWithDetails);

// Batches
router.post('/batches', authorizeRoles('agronomist', 'project_manager'), compostController.createBatch);
router.get('/batches', authorizeRoles('agronomist', 'project_manager'), compostController.getAllBatches);
router.get('/batches/:id', compostController.getBatchById);
router.put('/batches/:id', authorizeRoles('agronomist', 'project_manager'), compostController.updateBatch);

// Workdays
router.post('/workdays', authorizeRoles('agronomist', 'project_manager'), compostController.createWorkday);
router.get('/batches/:batchId/workdays', compostController.getWorkdaysByBatch);
router.get('/workers/:workerId/workdays', compostController.getWorkdaysByWorker);
router.put('/workdays/:id/payment', authorizeRoles('project_manager'), compostController.updatePaymentStatus);

// Payments & Summary
router.get('/payments/pending', authorizeRoles('project_manager'), compostController.getPendingPayments);
router.get('/summary', authorizeRoles('agronomist', 'project_manager'), compostController.getStipendSummary);

// Dashboard Summary (NEW)
router.get('/dashboard/summary', authorizeRoles('agronomist', 'project_manager'), compostController.getSummary);

// Feedstock Management (NEW)
router.post('/batches/:id/feedstock', authorizeRoles('agronomist', 'project_manager'), compostController.addFeedstockItem);
router.get('/batches/:id/feedstock', compostController.getFeedstockItems);

// Quality Metrics (NEW)
router.patch('/batches/:id/quality', authorizeRoles('agronomist', 'project_manager'), compostController.updateQualityMetrics);

// Sales Management (NEW)
router.post('/sales', authorizeRoles('agronomist', 'project_manager'), compostController.createSale);
router.get('/sales', compostController.getAllSales);
router.get('/batches/:id/sales', compostController.getSalesByBatch);

module.exports = router;