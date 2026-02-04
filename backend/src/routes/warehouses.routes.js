const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// =============================================
// FACILITY MANAGEMENT
// =============================================
router.get('/facilities', warehouseController.getAllFacilities);
router.post('/facilities', authorizeRoles('agronomist', 'project_manager'), warehouseController.createFacility);
router.get('/facilities/:id', warehouseController.getFacilityById);
router.put('/facilities/:id', authorizeRoles('agronomist', 'project_manager'), warehouseController.updateFacility);


// =============================================
// INVENTORY TRANSACTIONS
// =============================================
router.post('/incoming', authorizeRoles('agronomist', 'project_manager'), warehouseController.recordIncoming);
router.post('/outgoing', authorizeRoles('agronomist', 'project_manager'), warehouseController.recordOutgoing);
router.get('/transactions', warehouseController.getTransactions);

// =============================================
// DASHBOARD STATS
// =============================================
router.get('/stats', warehouseController.getStats);

// =============================================
// TEMPERATURE MONITORING
// =============================================
router.get('/temperature', warehouseController.getTemperatureLogs);
router.post('/temperature', authorizeRoles('agronomist', 'project_manager'), warehouseController.logTemperature);

// =============================================
// MAINTENANCE MANAGEMENT
// =============================================
router.get('/maintenance', warehouseController.getMaintenance);
router.post('/maintenance', authorizeRoles('agronomist', 'project_manager'), warehouseController.scheduleMaintenance);
router.put('/maintenance/:id/complete', authorizeRoles('agronomist', 'project_manager'), warehouseController.completeMaintenance);

module.exports = router;