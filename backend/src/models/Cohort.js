const pool = require('../config/database');

class Cohort {
  static async create(cohortData) {
    const {
      name, cropping_system, location, intercrops, target_area,
      start_date, childcare_support, repayment_threshold, seed_capital,
      warehouse_assign, boundary_coordinates
    } = cohortData;

    const query = `
      INSERT INTO cohorts (
        name, cropping_system, location, intercrops, target_area, 
        start_date, childcare_support, repayment_threshold, seed_capital, 
        profit_sharing_ratio, warehouse_assign, boundary_coordinates, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, '50/50', $10, $11, 'Active')
      RETURNING *
    `;

    // Ensure intercrops is an array for Postgres text[]
    const intercropsArray = Array.isArray(intercrops) ? intercrops : [];

    const values = [
      name, cropping_system, location, intercropsArray, target_area,
      start_date, childcare_support, repayment_threshold, seed_capital,
      warehouse_assign, boundary_coordinates
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

    const query = `UPDATE cohorts SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM cohorts WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Cohort;