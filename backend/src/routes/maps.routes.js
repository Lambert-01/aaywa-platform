const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');
const { authenticateToken } = require('../middleware/auth');

// All map routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/maps/farmers
 * @desc    Get all farmers with plot boundaries
 * @access  Private
 * @query   cohort_id (optional) - Filter by cohort
 * @query   household_type (optional) - Filter by household type
 */
router.get('/farmers', mapController.getFarmersGeo);

/**
 * @route   GET /api/maps/cohorts
 * @desc    Get all cohorts with boundary polygons
 * @access  Private
 */
router.get('/cohorts', mapController.getCohortsGeo);

/**
 * @route   GET /api/maps/warehouses
 * @desc    Get all warehouses with locations and status
 * @access  Private
 */
router.get('/warehouses', mapController.getWarehousesGeo);

/**
 * @route   GET /api/maps/aggregation-centers
 * @desc    Get all aggregation centers
 * @access  Private
 */
router.get('/aggregation-centers', mapController.getAggregationCenters);

/**
 * @route   POST /api/maps/measurements
 * @desc    Save a distance or area measurement
 * @access  Private
 * @body    { measurement_type, coordinates, calculated_value, unit, notes }
 */
router.post('/measurements', mapController.saveMeasurement);

/**
 * @route   GET /api/maps/stats
 * @desc    Get map statistics summary
 * @access  Private
 */
router.get('/stats', mapController.getMapStats);

module.exports = router;
