const pool = require('../config/database');

class Farmer {
  static async create(farmerData) {
    const { cohort_id, vsla_id, full_name, phone, date_of_birth, household_type, location_coordinates, location_address, plot_size, crops, photo_url } = farmerData;
    const query = `
      INSERT INTO farmers (cohort_id, vsla_id, full_name, phone, date_of_birth, household_type, location_coordinates, location_address, plot_size, crops, photo_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const values = [cohort_id, vsla_id, full_name, phone, date_of_birth, household_type, location_coordinates, location_address, plot_size, crops, photo_url];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT f.*,
             c.name as cohort_name, v.name as vsla_name
      FROM farmers f
      LEFT JOIN cohorts c ON f.cohort_id = c.id
      LEFT JOIN vsla_groups v ON f.vsla_id = v.id
      WHERE f.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findAll() {
    const query = `
      SELECT f.*,
             c.name as cohort_name, v.name as vsla_name
      FROM farmers f
      LEFT JOIN cohorts c ON f.cohort_id = c.id
      LEFT JOIN vsla_groups v ON f.vsla_id = v.id
      ORDER BY f.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async update(id, updateData) {
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

    const query = `UPDATE farmers SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM farmers WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Farmer;