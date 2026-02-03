const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// CRUD operations
router.post('/', authorizeRoles('manager', 'agronomist', 'buyer'), saleController.createSale);
router.get('/', authorizeRoles('manager', 'agronomist', 'buyer'), saleController.getAllSales);
router.get('/kpis', authorizeRoles('manager', 'agronomist'), saleController.getKPIs);
router.get('/farmer/:farmerId', saleController.getSalesByFarmer);
router.get('/farmer/:farmerId/summary', saleController.getFarmerSummary);
router.get('/:id', saleController.getSaleById);
router.get('/:id/statement', saleController.generateStatement);
router.delete('/:id', authorizeRoles('manager'), saleController.deleteSale);

module.exports = router;