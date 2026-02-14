const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// ==================== TRAINING SESSIONS ====================
router.post('/sessions', authorizeRoles('field_facilitator', 'project_manager'), trainingController.createSession);
router.get('/sessions', authorizeRoles('field_facilitator', 'project_manager', 'farmer', 'champion'), trainingController.getAllSessions);
router.get('/schedule', authorizeRoles('field_facilitator', 'project_manager', 'farmer', 'champion'), trainingController.getSchedule);
router.get('/sessions/:id', authorizeRoles('field_facilitator', 'project_manager', 'farmer', 'champion'), trainingController.getSessionById);
router.put('/sessions/:id', authorizeRoles('field_facilitator', 'project_manager'), trainingController.updateSession);
router.delete('/sessions/:id', authorizeRoles('project_manager'), trainingController.deleteSession);

// ==================== ATTENDANCE ====================
router.post('/attendance', authorizeRoles('field_facilitator', 'project_manager'), trainingController.recordAttendance);
router.get('/sessions/:sessionId/attendance', trainingController.getAttendanceBySession);
router.get('/my-badges', trainingController.getFarmerBadges);

// ==================== QUIZZES ====================
router.post('/quizzes', authorizeRoles('field_facilitator', 'project_manager'), trainingController.createQuiz);
router.get('/quizzes', trainingController.getAllQuizzes);
router.post('/quizzes/questions', authorizeRoles('field_facilitator', 'project_manager'), trainingController.addQuizQuestion);
router.post('/quizzes/results', trainingController.submitQuizResult);
router.get('/quizzes/results/farmer/:farmerId', trainingController.getQuizResultsByFarmer);

// ==================== LEARNING MATERIALS ====================
router.post('/materials', authorizeRoles('field_facilitator', 'project_manager'), trainingController.createMaterial);
router.get('/materials', authorizeRoles('field_facilitator', 'project_manager', 'farmer', 'champion'), trainingController.getAllMaterials);
router.put('/materials/:id/download', trainingController.incrementDownloadCount);
router.delete('/materials/:id', authorizeRoles('project_manager'), trainingController.deleteMaterial);

// ==================== ANALYTICS ====================
router.get('/stats', trainingController.getTrainingStats);
router.get('/participants', trainingController.getAllParticipants);
router.get('/participants/:farmerId', trainingController.getParticipantStats);

// ==================== CHAMPIONS ====================
router.post('/champions', authorizeRoles('field_facilitator', 'project_manager'), trainingController.createChampion);
router.get('/champions', trainingController.getAllChampions);
router.put('/champions/:farmerId', authorizeRoles('field_facilitator'), trainingController.updateChampionStats);

module.exports = router;