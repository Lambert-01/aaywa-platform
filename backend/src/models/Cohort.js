const pool = require('../config/database');

class Cohort {
  static async create(cohortData) {
    const {
      name, cropping_system, boundary_coordinates, intercrops
    } = cohortData;

    // Map cropping_system to lowercase to match check constraint
    const systemLower = cropping_system ? cropping_system.toLowerCase() : 'avocado';

    // Assign a random color if not provided (frontend usually handles this but good fallback)
    const color = '#4CAF50';

    const query = `
      INSERT INTO cohorts (
        name, cropping_system, boundary_coordinates, status, boundary_color, intercrops
      )
      VALUES ($1, $2, $3, 'active', $4, $5)
      RETURNING *
    `;

    // Handle jsonb field: pg converts arrays to '{...}' (PG array literal) but we need '[...]' (JSON string)
    // So we must stringify it explicitly if it's an object/array
    const boundaryJson = (typeof boundary_coordinates === 'object')
      ? JSON.stringify(boundary_coordinates)
      : boundary_coordinates;

    const values = [
      name, systemLower, boundaryJson, color, intercrops || []
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT c.*
      FROM cohorts c
      WHERE c.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findAll() {
    const query = `
      SELECT c.*
      FROM cohorts c
      WHERE c.status != 'suspended'
      ORDER BY c.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async update(id, updateData) {
    // Filter out undefined fields but also check against valid columns if needed
    // For now we assume updateData only contains valid keys or we wrap loosely
    const validColumns = ['name', 'cropping_system', 'boundary_coordinates', 'status', 'boundary_color', 'intercrops'];
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && validColumns.includes(key)) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(updateData[key]);
        paramIndex++;
      }
    });

    if (fields.length === 0) return null;

    const query = `UPDATE cohorts SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    // Soft delete using 'suspended' status as 'Deleted' is not in the check constraint
    const query = "UPDATE cohorts SET status = 'suspended' WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Cohort;