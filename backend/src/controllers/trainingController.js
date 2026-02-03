const Training = require('../models/Training');

const trainingController = {
  // Create new training session
  createSession: async (req, res) => {
    try {
      const { 
        title, 
        description, 
        training_type, 
        cohort_id, 
        conducted_by, 
        training_date,
        location,
        duration_hours
      } = req.body;

      const session = await Training.createSession({
        title,
        description,
        training_type,
        cohort_id,
        conducted_by,
        training_date,
        location,
        duration_hours
      });

      res.status(201).json({
        message: 'Training session created successfully',
        session
      });
    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({ error: 'Failed to create session' });
    }
  },

  // Get all sessions
  getAllSessions: async (req, res) => {
    try {
      const sessions = await Training.findAllSessions();
      res.json(sessions);
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  },

  // Get session by ID
  getSessionById: async (req, res) => {
    try {
      const { id } = req.params;
      const session = await Training.findSessionById(id);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Get attendance
      const attendance = await Training.getAttendanceBySession(id);

      res.json({
        ...session,
        attendance
      });
    } catch (error) {
      console.error('Get session error:', error);
      res.status(500).json({ error: 'Failed to fetch session' });
    }
  },

  // Get sessions by cohort
  getSessionsByCohort: async (req, res) => {
    try {
      const { cohortId } = req.params;
      const sessions = await Training.findSessionsByCohort(cohortId);
      res.json(sessions);
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  },

  // Update session
  updateSession: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const session = await Training.updateSession(id, updateData);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json({
        message: 'Session updated successfully',
        session
      });
    } catch (error) {
      console.error('Update session error:', error);
      res.status(500).json({ error: 'Failed to update session' });
    }
  },

  // Record attendance
  recordAttendance: async (req, res) => {
    try {
      const { id } = req.params;
      const { farmer_id, champion_id, cascade_level } = req.body;

      const attendance = await Training.recordAttendance({
        session_id: id,
        farmer_id,
        champion_id,
        cascade_level
      });

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
      const { id } = req.params;
      const attendance = await Training.getAttendanceBySession(id);
      res.json(attendance);
    } catch (error) {
      console.error('Get attendance error:', error);
      res.status(500).json({ error: 'Failed to fetch attendance' });
    }
  },

  // Get attendance by farmer
  getAttendanceByFarmer: async (req, res) => {
    try {
      const { farmerId } = req.params;
      const attendance = await Training.getAttendanceByFarmer(farmerId);
      res.json(attendance);
    } catch (error) {
      console.error('Get attendance error:', error);
      res.status(500).json({ error: 'Failed to fetch attendance' });
    }
  },

  // Get training stats
  getTrainingStats: async (req, res) => {
    try {
      const stats = await Training.getTrainingStats();
      res.json(stats);
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  },

  // Delete session
  deleteSession: async (req, res) => {
    try {
      const { id } = req.params;
      const session = await Training.deleteSession(id);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json({ message: 'Session deleted successfully' });
    } catch (error) {
      console.error('Delete session error:', error);
      res.status(500).json({ error: 'Failed to delete session' });
    }
  }
};

module.exports = trainingController;