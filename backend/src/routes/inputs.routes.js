const express = require('express');
const router = express.Router();
const inputController = require('../controllers/inputController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// CRUD operations
router.post('/', authorizeRoles('agronomist', 'project_manager', 'admin', 'field_facilitator'), inputController.createInvoice);
router.get('/', authorizeRoles('agronomist', 'project_manager', 'admin', 'field_facilitator'), inputController.getAllInvoices);
router.get('/farmer/:farmerId', inputController.getInvoicesByFarmer);
router.get('/:id', inputController.getInvoiceById);
router.put('/:id/status', authorizeRoles('agronomist'), inputController.updateStatus);
router.get('/farmer/:farmerId/balance', inputController.getOutstandingBalance);
router.delete('/:id', authorizeRoles('project_manager'), inputController.deleteInvoice);

module.exports = router;