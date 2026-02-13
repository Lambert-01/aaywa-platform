const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/roleGuard');

const auditLogger = require('../middleware/auditLogger');

// All admin routes require authentication and project_manager role
router.use(auth.authenticateToken);
router.use(rbac.roleGuard(['project_manager', 'admin']));

// Executive Dashboard
router.get('/executive-summary', auditLogger('VIEW_EXECUTIVE_SUMMARY'), adminController.getExecutiveSummary);

// Analytics
router.get('/analytics/by-cohort', auditLogger('VIEW_ANALYTICS_COHORT'), adminController.getAnalyticsByCohort);
router.get('/analytics/by-crop', auditLogger('VIEW_ANALYTICS_CROP'), adminController.getAnalyticsByCrop);
router.get('/analytics/by-period', auditLogger('VIEW_ANALYTICS_PERIOD'), adminController.getAnalyticsByPeriod);

// System Health
router.get('/system-health', auditLogger('VIEW_SYSTEM_HEALTH'), adminController.getSystemHealth);

// User Management
router.get('/users', auditLogger('VIEW_USERS'), adminController.getAllUsers);
router.put('/users/:id/status', auditLogger('UPDATE_USER_STATUS'), adminController.updateUserStatus);

module.exports = router;
