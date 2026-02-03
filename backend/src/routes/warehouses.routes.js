const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Facilities
router.post('/', authorizeRoles('manager', 'agronomist'), warehouseController.createFacility);
router.get('/', warehouseController.getAllFacilities);
router.get('/inventory/summary', authorizeRoles('manager', 'agronomist'), warehouseController.getInventorySummary);
router.get('/:id', warehouseController.getFacilityById);
router.put('/:id', authorizeRoles('manager', 'agronomist'), warehouseController.updateFacility);
router.delete('/:id', authorizeRoles('manager'), warehouseController.deleteFacility);

// Stored Produce
router.post('/produce', authorizeRoles('manager', 'agronomist'), warehouseController.storeProduce);
router.get('/produce/farmer/:farmerId', warehouseController.getProduceByFarmer);
router.get('/produce/:id', warehouseController.getProduceById);
router.post('/produce/:id/retrieve', authorizeRoles('manager', 'agronomist'), warehouseController.retrieveProduce);

// Storage Fees
router.post('/fees/calculate', warehouseController.calculateFee);

// Temperature Logs
router.post('/temperature', authorizeRoles('manager', 'agronomist'), warehouseController.logTemperature);
router.get('/:warehouseId/temperature', warehouseController.getTemperatureLogs);

// Maintenance
router.post('/maintenance', authorizeRoles('manager', 'agronomist'), warehouseController.createMaintenanceLog);
router.get('/:warehouseId/maintenance', warehouseController.getMaintenanceLogs);

module.exports = router;