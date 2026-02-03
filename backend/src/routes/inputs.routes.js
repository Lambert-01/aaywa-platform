const express = require('express');
const router = express.Router();
const inputController = require('../controllers/inputController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// CRUD operations
router.post('/', authorizeRoles('manager', 'agronomist'), inputController.createInvoice);
router.get('/', authorizeRoles('manager', 'agronomist', 'buyer'), inputController.getAllInvoices);
router.get('/farmer/:farmerId', inputController.getInvoicesByFarmer);
router.get('/:id', inputController.getInvoiceById);
router.put('/:id/status', authorizeRoles('manager', 'agronomist'), inputController.updateStatus);
router.get('/farmer/:farmerId/balance', inputController.getOutstandingBalance);
router.delete('/:id', authorizeRoles('manager'), inputController.deleteInvoice);

module.exports = router;