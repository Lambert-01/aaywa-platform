const pool = require('../config/database');

class Training {
  // Training Sessions
  static async createSession(sessionData) {
    const { 
      title, 
      description, 
      training_type, 
      cohort_id, 
      conducted_by, 
      training_date,
      location,
      duration_hours
    } = sessionData;

    const query = `
      INSERT INTO training_sessions 
        (title, description, training_type, cohort_id, conducted_by, training_date, location, duration_hours)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [title, description, training_type, cohort_id, conducted_by, training_date, location, duration_hours];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findSessionById(id) {
    const query = `
      SELECT ts.*, 
             c.name as cohort_name,
             u.full_name as conductor_name
      FROM training_sessions ts
      LEFT JOIN cohorts c ON ts.cohort_id = c.id
      LEFT JOIN users u ON ts.conducted_by = u.id
      WHERE ts.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findAllSessions() {
    const query = `
      SELECT ts.*, 
             c.name as cohort_name,
             u.full_name as conductor_name,
             COUNT(ta.id) as attendance_count
      FROM training_sessions ts
      LEFT JOIN cohorts c ON ts.cohort_id = c.id
      LEFT JOIN users u ON ts.conducted_by = u.id
      LEFT JOIN training_attendance ta ON ts.id = ta.session_id
      GROUP BY ts.id, c.name, u.full_name
      ORDER BY ts.training_date DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async findSessionsByCohort(cohortId) {
    const query = `
      SELECT ts.*, u.full_name as conductor_name,
             COUNT(ta.id) as attendance_count
      FROM training_sessions ts
      LEFT JOIN users u ON ts.conducted_by = u.id
      LEFT JOIN training_attendance ta ON ts.id = ta.session_id
      WHERE ts.cohort_id = $1
      GROUP BY ts.id, u.full_name
      ORDER BY ts.training_date DESC
    `;
    const result = await pool.query(query, [cohortId]);
    return result.rows;
  }

  static async updateSession(id, updateData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(updateData[key]);
        paramIndex++;
      }
    });

    if (fields.length === 0) return null;

    const query = `UPDATE training_sessions SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Training Attendance
  static async recordAttendance(attendanceData) {
    const { session_id, farmer_id, champion_id, cascade_level } = attendanceData;
    const query = `
      INSERT INTO training_attendance (session_id, farmer_id, champion_id, cascade_level)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [session_id, farmer_id, champion_id, cascade_level || 1];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getAttendanceBySession(sessionId) {
    const query = `
      SELECT ta.*, u.full_name as farmer_name, u.phone as farmer_phone
      FROM training_attendance ta
      JOIN farmers f ON ta.farmer_id = f.id
      JOIN users u ON f.user_id = u.id
      WHERE ta.session_id = $1
    `;
    const result = await pool.query(query, [sessionId]);
    return result.rows;
  }

  static async getAttendanceByFarmer(farmerId) {
    const query = `
      SELECT ta.*, ts.title as session_title, ts.training_date, ts.training_type
      FROM training_attendance ta
      JOIN training_sessions ts ON ta.session_id = ts.id
      WHERE ta.farmer_id = $1
      ORDER BY ts.training_date DESC
    `;
    const result = await pool.query(query, [farmerId]);
    return result.rows;
  }

  static async getTrainingStats() {
    const query = `
      SELECT 
        COUNT(DISTINCT ts.id) as total_sessions,
        COUNT(ta.id) as total_attendance,
        COUNT(DISTINCT ta.farmer_id) as unique_farmers_trained,
        AVG(ts.duration_hours) as avg_duration
      FROM training_sessions ts
      LEFT JOIN training_attendance ta ON ts.id = ta.session_id
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }

  static async deleteSession(id) {
    const query = 'DELETE FROM training_sessions WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Training;