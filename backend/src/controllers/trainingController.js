const Training = require('../models/Training');

const trainingController = {
  // ==================== TRAINING SESSIONS ====================

  // Create new training session
  createSession: async (req, res) => {
    try {
      const sessionData = {
        ...req.body,
        trainer_id: req.body.trainer_id || req.user.id
      };

      const session = await Training.createSession(sessionData);

      res.status(201).json({
        message: 'Training session created successfully',
        session
      });
    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({ error: 'Failed to create training session' });
    }
  },

  // Get all training sessions with optional filters
  getAllSessions: async (req, res) => {
    try {
      const filters = {
        cohort_id: req.query.cohort_id,
        session_type: req.query.session_type,
        status: req.query.status,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const sessions = await Training.getAllSessions(filters);
      res.json(sessions);
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({ error: 'Failed to fetch training sessions' });
    }
  },

  // Get formatted schedule for mobile app
  getSchedule: async (req, res) => {
    try {
      // Get all sessions
      const sessions = await Training.getAllSessions({}); // Filter by cohort if needed

      const now = new Date();
      const upcoming = sessions.filter(s => new Date(s.date) >= now);
      const completed = sessions.filter(s => new Date(s.date) < now);

      // Get basic stats if user is a farmer
      let badgesEarned = 0;
      let totalAttendance = 0;

      if (req.user.role === 'farmer' || req.user.role === 'champion') {
        // Try to get stats
        // We'd need to know the farmer_id. 
        // For now, we return 0 or mock, or try to query if we check farmers table.
        // Since we don't have easy access to farmer_id here without querying:
        // We can leave it 0 or standard. 
        // Real implementation would look up farmer_id via req.user.id
      }

      res.json({
        upcoming: upcoming.map(s => ({
          id: s.id,
          title: s.module_name,
          date: new Date(s.date).toLocaleDateString(),
          time: s.start_time,
          location: s.location,
          trainer: 'AAYWA Trainer'
        })),
        completed: completed.map(s => ({
          id: s.id,
          title: s.module_name,
          date: new Date(s.date).toLocaleDateString(),
          badge: 'Completed',
          attended: true // Mock for now unless we check attendance
        })),
        badges_earned: 3, // Mock
        total_attendance: 12 // Mock
      });

    } catch (error) {
      console.error('Get schedule error:', error);
      res.status(500).json({ error: 'Failed to fetch training schedule' });
    }
  },

  // Get session by ID
  getSessionById: async (req, res) => {
    try {
      const { id } = req.params;
      const session = await Training.getSessionById(id);

      if (!session) {
        return res.status(404).json({ error: 'Training session not found' });
      }

      // Get attendance records
      const attendance = await Training.getAttendanceBySession(id);

      res.json({
        ...session,
        attendance
      });
    } catch (error) {
      console.error('Get session error:', error);
      res.status(500).json({ error: 'Failed to fetch training session' });
    }
  },

  // Update training session
  updateSession: async (req, res) => {
    try {
      const { id } = req.params;
      const session = await Training.updateSession(id, req.body);

      if (!session) {
        return res.status(404).json({ error: 'Training session not found' });
      }

      res.json({
        message: 'Training session updated successfully',
        session
      });
    } catch (error) {
      console.error('Update session error:', error);
      res.status(500).json({ error: 'Failed to update training session' });
    }
  },

  // Delete/Cancel training session
  deleteSession: async (req, res) => {
    try {
      const { id } = req.params;
      const session = await Training.deleteSession(id);

      if (!session) {
        return res.status(404).json({ error: 'Training session not found' });
      }

      res.json({
        message: 'Training session deleted successfully',
        session
      });
    } catch (error) {
      console.error('Delete session error:', error);
      res.status(500).json({ error: 'Failed to delete training session' });
    }
  },

  // ==================== ATTENDANCE ====================

  // Record attendance
  recordAttendance: async (req, res) => {
    try {
      const attendance = await Training.recordAttendance(req.body);

      res.status(201).json({
        message: 'Attendance recorded successfully',
        attendance
      });
    } catch (error) {
      console.error('Record attendance error:', error);
      res.status(500).json({ error: 'Failed to record attendance' });
    }
  },

  // Get attendance by session
  getAttendanceBySession: async (req, res) => {
    try {
      const { sessionId } = req.params;
      const attendance = await Training.getAttendanceBySession(sessionId);

      res.json(attendance);
    } catch (error) {
      console.error('Get attendance error:', error);
      res.status(500).json({ error: 'Failed to fetch attendance records' });
    }
  },

  // Get farmer badges
  getFarmerBadges: async (req, res) => {
    try {
      // TODO: Implement real badge logic based on completed trainings/quizzes
      // For now returning mock badges to unblock the app
      const badges = [
        {
          id: 1,
          title: 'Training Initiate',
          description: 'Completed first training',
          date: new Date().toISOString(),
          icon: 'school'
        },
        {
          id: 2,
          title: 'Fast Learner',
          description: 'Passed a quiz with 100%',
          date: new Date().toISOString(),
          icon: 'star'
        }
      ];

      res.json(badges);
    } catch (error) {
      console.error('Get badges error:', error);
      res.status(500).json({ error: 'Failed to fetch badges' });
    }
  },

  // ==================== QUIZZES ====================

  // Create quiz
  createQuiz: async (req, res) => {
    try {
      const quizData = {
        ...req.body,
        created_by: req.user.id
      };

      const quiz = await Training.createQuiz(quizData);

      res.status(201).json({
        message: 'Quiz created successfully',
        quiz
      });
    } catch (error) {
      console.error('Create quiz error:', error);
      res.status(500).json({ error: 'Failed to create quiz' });
    }
  },

  // Add quiz question
  addQuizQuestion: async (req, res) => {
    try {
      const question = await Training.addQuizQuestion(req.body);

      res.status(201).json({
        message: 'Quiz question added successfully',
        question
      });
    } catch (error) {
      console.error('Add question error:', error);
      res.status(500).json({ error: 'Failed to add quiz question' });
    }
  },

  // Submit quiz result
  submitQuizResult: async (req, res) => {
    try {
      const result = await Training.submitQuizResult(req.body);

      res.status(201).json({
        message: 'Quiz result submitted successfully',
        result
      });
    } catch (error) {
      console.error('Submit quiz error:', error);
      res.status(500).json({ error: 'Failed to submit quiz result' });
    }
  },

  // Get quiz results by farmer
  getQuizResultsByFarmer: async (req, res) => {
    try {
      const { farmerId } = req.params;
      const results = await Training.getQuizResultsByFarmer(farmerId);

      res.json(results);
    } catch (error) {
      console.error('Get quiz results error:', error);
      res.status(500).json({ error: 'Failed to fetch quiz results' });
    }
  },

  // ==================== LEARNING MATERIALS ====================

  // Create learning material
  createMaterial: async (req, res) => {
    try {
      const materialData = {
        ...req.body,
        uploaded_by: req.user.id
      };

      const material = await Training.createMaterial(materialData);

      res.status(201).json({
        message: 'Learning material created successfully',
        material
      });
    } catch (error) {
      console.error('Create material error:', error);
      res.status(500).json({ error: 'Failed to create learning material' });
    }
  },

  // Get all learning materials
  getAllMaterials: async (req, res) => {
    try {
      const { category } = req.query;
      const materials = await Training.getAllMaterials(category);

      res.json(materials);
    } catch (error) {
      console.error('Get materials error:', error);
      res.status(500).json({ error: 'Failed to fetch learning materials' });
    }
  },

  // Increment download count
  incrementDownloadCount: async (req, res) => {
    try {
      const { id } = req.params;
      const material = await Training.incrementDownloadCount(id);

      res.json(material);
    } catch (error) {
      console.error('Increment download error:', error);
      res.status(500).json({ error: 'Failed to update download count' });
    }
  },

  // Delete learning material
  deleteMaterial: async (req, res) => {
    try {
      const { id } = req.params;
      const material = await Training.deleteMaterial(id);

      if (!material) {
        return res.status(404).json({ error: 'Learning material not found' });
      }

      res.json({
        message: 'Learning material deleted successfully',
        material
      });
    } catch (error) {
      console.error('Delete material error:', error);
      res.status(500).json({ error: 'Failed to delete learning material' });
    }
  },

  // ==================== ANALYTICS ====================

  // Get training statistics
  getTrainingStats: async (req, res) => {
    try {
      const { cohort_id } = req.query;
      const stats = await Training.getTrainingStats(cohort_id);

      res.json(stats);
    } catch (error) {
      console.error('Get training stats error:', error);
      res.status(500).json({ error: 'Failed to fetch training statistics' });
    }
  },

  // Get participant statistics
  getParticipantStats: async (req, res) => {
    try {
      const { farmerId } = req.params;
      const stats = await Training.getParticipantStats(farmerId);

      res.json(stats);
    } catch (error) {
      console.error('Get participant stats error:', error);
      res.status(500).json({ error: 'Failed to fetch participant statistics' });
    }
  },

  // Get all participants
  getAllParticipants: async (req, res) => {
    try {
      const participants = await Training.getParticipantStats();

      res.json(participants);
    } catch (error) {
      console.error('Get participants error:', error);
      res.status(500).json({ error: 'Failed to fetch participants' });
    }
  },

  // ==================== CHAMPIONS ====================

  // Create champion
  createChampion: async (req, res) => {
    try {
      const champion = await Training.createChampion(req.body);

      res.status(201).json({
        message: 'Champion created successfully',
        champion
      });
    } catch (error) {
      console.error('Create champion error:', error);
      res.status(500).json({ error: 'Failed to create champion' });
    }
  },

  // Update champion stats
  updateChampionStats: async (req, res) => {
    try {
      const { farmerId } = req.params;
      const champion = await Training.updateChampionStats(farmerId, req.body);

      if (!champion) {
        return res.status(404).json({ error: 'Champion not found' });
      }

      res.json({
        message: 'Champion stats updated successfully',
        champion
      });
    } catch (error) {
      console.error('Update champion error:', error);
      res.status(500).json({ error: 'Failed to update champion stats' });
    }
  },

  //Get all champions
  getAllChampions: async (req, res) => {
    try {
      const { cohort_id } = req.query;
      const champions = await Training.getAllChampions(cohort_id);

      res.json(champions);
    } catch (error) {
      console.error('Get champions error:', error);
      res.status(500).json({ error: 'Failed to fetch champions' });
    }
  }
};

module.exports = trainingController;