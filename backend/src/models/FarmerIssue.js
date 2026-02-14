const pool = require('../config/database');

class FarmerIssue {
    static async create(data) {
        const {
            farmer_id, category, description, urgency,
            gps_lat, gps_lng, photo_url
        } = data;

        const query = `
      INSERT INTO farmer_issues 
      (farmer_id, category, description, urgency, gps_lat, gps_lng, photo_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

        const values = [
            farmer_id, category, description, urgency,
            gps_lat || null, gps_lng || null, photo_url || null
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async findAll() {
        // Join with farmers table to get name? For now just raw issues.
        // Ideally: 
        // SELECT fi.*, f.first_name, f.last_name FROM farmer_issues fi LEFT JOIN farmers f ON fi.farmer_id = f.id
        // But assuming farmer_id is remoteId (UUID/String) or local ID. 
        // Mobile sends what it has.

        const query = `
      SELECT * FROM farmer_issues ORDER BY created_at DESC
    `;
        const { rows } = await pool.query(query);
        return rows;
    }

    static async findById(id) {
        const query = `SELECT * FROM farmer_issues WHERE id = $1`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    static async updateStatus(id, status, assigned_to, resolution_notes) {
        const query = `
      UPDATE farmer_issues 
      SET status = $2, assigned_to = $3, resolution_notes = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
        const { rows } = await pool.query(query, [id, status, assigned_to, resolution_notes]);
        return rows[0];
    }
}

module.exports = FarmerIssue;
