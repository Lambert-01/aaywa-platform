const pool = require('../config/database');

class Catalog {
  static async findAll() {
    const query = `
      SELECT * FROM catalog
      ORDER BY crop_type, variety
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM catalog WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Add more methods as needed, e.g., findByCropType, etc.
}

module.exports = Catalog;