const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// ==================== TRAINING SESSIONS ====================
router.post('/sessions', authorizeRoles('manager', 'field_facilitator', 'agronomist', 'project_manager'), trainingController.createSession);
router.get('/sessions', trainingController.getAllSessions);
router.get('/sessions/:id', trainingController.getSessionById);
router.put('/sessions/:id', authorizeRoles('manager', 'field_facilitator', 'agronomist', 'project_manager'), trainingController.updateSession);
router.delete('/sessions/:id', authorizeRoles('manager', 'project_manager'), trainingController.deleteSession);

// ==================== ATTENDANCE ====================
router.post('/attendance', authorizeRoles('manager', 'field_facilitator', 'agronomist', 'champion'), trainingController.recordAttendance);
router.get('/sessions/:sessionId/attendance', trainingController.getAttendanceBySession);

// ==================== QUIZZES ====================
router.post('/quizzes', authorizeRoles('manager', 'field_facilitator', 'agronomist'), trainingController.createQuiz);
router.post('/quizzes/questions', authorizeRoles('manager', 'field_facilitator', 'agronomist'), trainingController.addQuizQuestion);
router.post('/quizzes/results', trainingController.submitQuizResult);
router.get('/quizzes/results/farmer/:farmerId', trainingController.getQuizResultsByFarmer);

// ==================== LEARNING MATERIALS ====================
router.post('/materials', authorizeRoles('manager', 'field_facilitator', 'agronomist', 'project_manager'), trainingController.createMaterial);
router.get('/materials', trainingController.getAllMaterials);
router.put('/materials/:id/download', trainingController.incrementDownloadCount);
router.delete('/materials/:id', authorizeRoles('manager', 'project_manager'), trainingController.deleteMaterial);

// ==================== ANALYTICS ====================
router.get('/stats', trainingController.getTrainingStats);
router.get('/participants', trainingController.getAllParticipants);
router.get('/participants/:farmerId', trainingController.getParticipantStats);

// ==================== CHAMPIONS ====================
router.post('/champions', authorizeRoles('manager', 'field_facilitator', 'project_manager'), trainingController.createChampion);
router.get('/champions', trainingController.getAllChampions);
router.put('/champions/:farmerId', authorizeRoles('manager', 'field_facilitator'), trainingController.updateChampionStats);

module.exports = router;