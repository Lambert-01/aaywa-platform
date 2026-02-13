const pool = require('../config/database');

class Training {
  // ==================== TRAINING SESSIONS ====================

  static async createSession(sessionData) {
    const {
      title,
      cohort_id,
      trainer_id,
      session_type,
      date,
      duration_hours,
      location,
      childcare_provided,
      materials,
      expected_attendees,
      notes
    } = sessionData;

    const query = `
      INSERT INTO training_sessions (
        title, cohort_id, trainer_id, session_type, date, duration_hours,
        location, childcare_provided, materials, expected_attendees, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      title,
      cohort_id,
      trainer_id,
      session_type,
      date,
      duration_hours || 2.0,
      location,
      childcare_provided || false,
      JSON.stringify(materials || []),
      expected_attendees || 0,
      notes
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getAllSessions(filters = {}) {
    let query = 'SELECT * FROM training_session_summary WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (filters.cohort_id) {
      query += ` AND cohort_id = $${paramIndex}`;
      values.push(filters.cohort_id);
      paramIndex++;
    }

    if (filters.session_type) {
      query += ` AND session_type = $${paramIndex}`;
      values.push(filters.session_type);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      values.push(filters.status);
      paramIndex++;
    }

    if (filters.start_date) {
      query += ` AND date >= $${paramIndex}`;
      values.push(filters.start_date);
      paramIndex++;
    }

    if (filters.end_date) {
      query += ` AND date <= $${paramIndex}`;
      values.push(filters.end_date);
      paramIndex++;
    }

    query += ' ORDER BY date DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async getSessionById(id) {
    const query = 'SELECT * FROM training_session_summary WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updateSession(id, updateData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = [
      'title', 'cohort_id', 'trainer_id', 'session_type', 'date',
      'duration_hours', 'location', 'childcare_provided', 'materials',
      'expected_attendees', 'actual_attendees', 'status', 'notes'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`);
        values.push(field === 'materials' ? JSON.stringify(updateData[field]) : updateData[field]);
        paramIndex++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE training_sessions 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async deleteSession(id) {
    const query = 'DELETE FROM training_sessions WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // ==================== ATTENDANCE ====================

  static async recordAttendance(attendanceData) {
    const {
      session_id,
      farmer_id,
      attendance_status,
      check_in_method,
      check_in_time,
      childcare_used,
      feedback_score,
      notes
    } = attendanceData;

    const query = `
      INSERT INTO training_attendance (
        session_id, farmer_id, attendance_status, check_in_method,
        check_in_time, childcare_used, feedback_score, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      session_id,
      farmer_id,
      attendance_status || 'present',
      check_in_method || 'manual',
      check_in_time || new Date(),
      childcare_used || false,
      feedback_score,
      notes
    ];

    const result = await pool.query(query, values);

    // Update actual_attendees count
    await this.updateActualAttendees(session_id);

    return result.rows[0];
  }

  static async getAttendanceBySession(sessionId) {
    const query = `
      SELECT 
        ta.*,
        f.full_name as farmer_name,
        f.phone as farmer_phone,
        f.cohort_id
      FROM training_attendance ta
      JOIN farmers f ON ta.farmer_id = f.id
      WHERE ta.session_id = $1
      ORDER BY ta.check_in_time DESC
    `;

    const result = await pool.query(query, [sessionId]);
    return result.rows;
  }

  static async updateActualAttendees(sessionId) {
    const query = `
      UPDATE training_sessions
      SET actual_attendees = (
        SELECT COUNT(*) FROM training_attendance
        WHERE session_id = $1 AND attendance_status = 'present'
      )
      WHERE id = $1
    `;

    await pool.query(query, [sessionId]);
  }

  // ==================== QUIZZES ====================

  static async createQuiz(quizData) {
    const { session_id, title, category, passing_score, total_points, created_by } = quizData;

    const query = `
      INSERT INTO quizzes (session_id, title, category, passing_score, total_points, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await pool.query(query, [
      session_id,
      title,
      category,
      passing_score || 70,
      total_points || 10,
      created_by
    ]);

    return result.rows[0];
  }

  static async getAllQuizzes(filters = {}) {
    let query = `
      SELECT q.*, ts.title as session_title 
      FROM quizzes q
      LEFT JOIN training_sessions ts ON q.session_id = ts.id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (filters.session_id) {
      query += ` AND q.session_id = $${paramIndex}`;
      values.push(filters.session_id);
      paramIndex++;
    }

    if (filters.category) {
      query += ` AND q.category = $${paramIndex}`;
      values.push(filters.category);
      paramIndex++;
    }

    query += ' ORDER BY q.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async addQuizQuestion(questionData) {
    const { quiz_id, question_text, options, correct_answer, points, explanation } = questionData;

    const query = `
      INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer, points, explanation)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await pool.query(query, [
      quiz_id,
      question_text,
      JSON.stringify(options),
      correct_answer,
      points || 1,
      explanation
    ]);

    return result.rows[0];
  }

  static async submitQuizResult(resultData) {
    const { quiz_id, farmer_id, answers, submission_method } = resultData;

    // Get quiz details and questions
    const quizQuery = 'SELECT * FROM quizzes WHERE id = $1';
    const quiz = await pool.query(quizQuery, [quiz_id]);

    if (!quiz.rows[0]) throw new Error('Quiz not found');

    const questionsQuery = 'SELECT * FROM quiz_questions WHERE quiz_id = $1';
    const questions = await pool.query(questionsQuery, [quiz_id]);

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;

    questions.rows.forEach(q => {
      totalPoints += q.points;
      if (answers[q.id] === q.correct_answer) {
        correctAnswers += q.points;
      }
    });

    const score = totalPoints > 0 ? (correctAnswers / totalPoints) * 100 : 0;
    const passed = score >= quiz.rows[0].passing_score;

    const insertQuery = `
      INSERT INTO quiz_results (quiz_id, farmer_id, score, passed, answers, submission_method)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      quiz_id,
      farmer_id,
      score,
      passed,
      JSON.stringify(answers),
      submission_method || 'mobile_app'
    ]);

    return result.rows[0];
  }

  static async getQuizResultsByFarmer(farmerId) {
    const query = `
      SELECT 
        qr.*,
        q.title as quiz_title,
        q.category,
        q.passing_score
      FROM quiz_results qr
      JOIN quizzes q ON qr.quiz_id = q.id
      WHERE qr.farmer_id = $1
      ORDER BY qr.submitted_at DESC
    `;

    const result = await pool.query(query, [farmerId]);
    return result.rows;
  }

  // ==================== LEARNING MATERIALS ====================

  static async createMaterial(materialData) {
    const { title, category, file_type, file_url, version, description, uploaded_by } = materialData;

    const query = `
      INSERT INTO learning_materials (title, category, file_type, file_url, version, description, uploaded_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await pool.query(query, [
      title,
      category,
      file_type,
      file_url,
      version || '1.0',
      description,
      uploaded_by
    ]);

    return result.rows[0];
  }

  static async getAllMaterials(category = null) {
    let query = `
      SELECT 
        lm.*,
        u.full_name as uploaded_by_name
      FROM learning_materials lm
      LEFT JOIN users u ON lm.uploaded_by = u.id
    `;

    if (category) {
      query += ' WHERE lm.category = $1';
      const result = await pool.query(query + ' ORDER BY lm.created_at DESC', [category]);
      return result.rows;
    }

    const result = await pool.query(query + ' ORDER BY lm.created_at DESC');
    return result.rows;
  }

  static async incrementDownloadCount(materialId) {
    const query = `
      UPDATE learning_materials 
      SET download_count = download_count + 1
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [materialId]);
    return result.rows[0];
  }

  static async deleteMaterial(id) {
    const query = 'DELETE FROM learning_materials WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // ==================== ANALYTICS ====================

  static async getTrainingStats(cohortId = null) {
    let query = `
      SELECT 
        COUNT(DISTINCT id) as total_sessions,
        ROUND(AVG(CASE 
          WHEN expected_attendees > 0 
          THEN (actual_attendees::DECIMAL / expected_attendees * 100) 
          ELSE 0 
        END), 2) as avg_attendance_rate,
        COUNT(DISTINCT CASE WHEN status = 'Completed' THEN id END) as completed_sessions,
        COUNT(DISTINCT CASE WHEN childcare_provided = true THEN id END) as childcare_provided_count,
        SUM(actual_attendees) as total_attendees
      FROM training_sessions
    `;

    if (cohortId) {
      query += ' WHERE cohort_id = $1';
      const result = await pool.query(query, [cohortId]);
      return result.rows[0];
    }

    const result = await pool.query(query);
    const stats = result.rows[0];

    // Get session type breakdown
    const typeQuery = `
      SELECT session_type as type, COUNT(*) as count 
      FROM training_sessions 
      GROUP BY session_type
    `;
    const typeResult = await pool.query(typeQuery);
    stats.session_types = typeResult.rows;

    // Get champion count
    const championsQuery = `SELECT COUNT(*) as champions_trained FROM champions WHERE status = $1`;
    const championsResult = await pool.query(championsQuery, ['active']);
    stats.champions_trained = parseInt(championsResult.rows[0].champions_trained);

    // Get peers mentored
    const peersQuery = 'SELECT SUM(peers_trained) as peers_mentored FROM champions';
    const peersResult = await pool.query(peersQuery);
    stats.peers_mentored = parseInt(peersResult.rows[0].peers_mentored) || 0;

    // Get materials distributed
    const materialsQuery = 'SELECT COUNT(*) as materials_distributed FROM learning_materials';
    const materialsResult = await pool.query(materialsQuery);
    stats.materials_distributed = parseInt(materialsResult.rows[0].materials_distributed);

    return stats;
  }

  static async getParticipantStats(farmerId = null) {
    let query = 'SELECT * FROM participant_training_stats';

    if (farmerId) {
      query += ' WHERE farmer_id = $1';
      const result = await pool.query(query, [farmerId]);
      return result.rows[0];
    }

    const result = await pool.query(query + ' ORDER BY sessions_attended DESC');
    return result.rows;
  }

  // ==================== CHAMPIONS ====================

  static async createChampion(championData) {
    const { farmer_id, cohort_id, certified_date, peers_assigned } = championData;

    const query = `
      INSERT INTO champions (farmer_id, cohort_id, certified_date, peers_assigned)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(query, [
      farmer_id,
      cohort_id,
      certified_date || new Date(),
      peers_assigned || 0
    ]);

    return result.rows[0];
  }

  static async updateChampionStats(farmerId, updateData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = ['peers_trained', 'sessions_led', 'avg_attendance_rate', 'avg_feedback_score', 'status'];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`);
        values.push(updateData[field]);
        paramIndex++;
      }
    });

    if (fields.length === 0) return null;

    values.push(farmerId);
    const query = `
      UPDATE champions 
      SET ${fields.join(', ')}
      WHERE farmer_id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getAllChampions(cohortId = null) {
    let query = `
      SELECT 
        ch.*,
        f.full_name as champion_name,
        f.phone as champion_phone,
        c.name as cohort_name
      FROM champions ch
      JOIN farmers f ON ch.farmer_id = f.id
      JOIN cohorts c ON ch.cohort_id = c.id
    `;

    if (cohortId) {
      query += ' WHERE ch.cohort_id = $1';
      const result = await pool.query(query + ' ORDER BY ch.certified_date DESC', [cohortId]);
      return result.rows;
    }

    const result = await pool.query(query + ' ORDER BY ch.certified_date DESC');
    return result.rows;
  }
}

module.exports = Training;