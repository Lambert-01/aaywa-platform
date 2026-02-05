const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const alertController = require('../controllers/alertController');

// All routes require authentication
router.use(authenticateToken);

// Get active alerts (all roles)
router.get('/', alertController.getActiveAlerts);

// Generate new alerts (project_manager only - runs as background job)
router.post('/generate',
    authorizeRoles('project_manager'),
    alertController.generateAlerts
);

// Dismiss an alert (all roles can dismiss their own alerts)
router.patch('/:id/dismiss', alertController.dismissAlert);

// Get alert history (project_manager only)
router.get('/history',
    authorizeRoles('project_manager'),
    alertController.getAlertHistory
);

module.exports = router;
