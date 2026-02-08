const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    getKPIs,
    getRecentActivity,
    getCohortStats,
    getVSLASummary,
    getDashboardCharts,
    getDashboardMap,
    getUpcomingEvents
} = require('../controllers/dashboardController');

// All dashboard endpoints require authentication
router.use(authenticateToken);

// Dashboard KPIs and analytics
// Dashboard KPIs and analytics
router.get('/kpi', getKPIs);
router.get('/activity', getRecentActivity);
router.get('/cohort-stats', getCohortStats);
router.get('/vsla-summary', getVSLASummary);
router.get('/charts', getDashboardCharts);
router.get('/map', getDashboardMap);
router.get('/events', getUpcomingEvents);

module.exports = router;
