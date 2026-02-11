const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// CRUD operations
router.post('/', authorizeRoles('agronomist', 'project_manager', 'farmer', 'champion'), saleController.createSale);
router.get('/', authorizeRoles('agronomist', 'project_manager'), saleController.getAllSales);
router.get('/kpis', authorizeRoles('agronomist', 'project_manager'), saleController.getKPIs);
router.get('/my-sales', authorizeRoles('farmer', 'champion', 'project_manager'), saleController.getMySales);
router.get('/farmer/:farmerId', saleController.getSalesByFarmer);
router.get('/farmer/:farmerId/summary', saleController.getFarmerSummary);
router.get('/:id', saleController.getSaleById);
router.get('/:id/statement', saleController.generateStatement);
router.delete('/:id', authorizeRoles('project_manager'), saleController.deleteSale);

module.exports = router;