const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Sessions
router.post('/', authorizeRoles('manager', 'agronomist'), trainingController.createSession);
router.get('/', trainingController.getAllSessions);
router.get('/stats', authorizeRoles('manager', 'agronomist'), trainingController.getTrainingStats);
router.get('/cohort/:cohortId', trainingController.getSessionsByCohort);
router.get('/:id', trainingController.getSessionById);
router.put('/:id', authorizeRoles('manager', 'agronomist'), trainingController.updateSession);
router.delete('/:id', authorizeRoles('manager'), trainingController.deleteSession);

// Attendance
router.post('/:id/attendance', authorizeRoles('manager', 'agronomist', 'champion'), trainingController.recordAttendance);
router.get('/:id/attendance', trainingController.getAttendanceBySession);
router.get('/farmer/:farmerId/attendance', trainingController.getAttendanceByFarmer);

module.exports = router;