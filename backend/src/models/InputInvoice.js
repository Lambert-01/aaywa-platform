const pool = require('../config/database');

class InputInvoice {
  static async create(invoiceData) {
    const { farmer_id, items, total_amount, issued_by, input_type } = invoiceData;
    // Determine input type if not provided, default to 'mixed'
    const type = input_type || 'mixed';
    // Calculate total quantity from items
    const total_quantity = items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0) || 1;
    // Calculate average unit price (total / quantity) to satisfy schema constraint
    const avg_unit_price = total_quantity > 0 ? (total_amount / total_quantity) : 0;

    const query = `
      INSERT INTO input_invoices (farmer_id, items, total_amount, issued_by, input_type, quantity, unit_price, total_cost)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [farmer_id, JSON.stringify(items), total_amount, issued_by, type, total_quantity, avg_unit_price, total_amount];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT ii.*, f.full_name as farmer_name, f.phone as farmer_phone
      FROM input_invoices ii
      JOIN farmers f ON ii.farmer_id = f.id
      WHERE ii.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findAll() {
    const query = `
      SELECT ii.*, f.full_name as farmer_name, f.phone as farmer_phone
      FROM input_invoices ii
      JOIN farmers f ON ii.farmer_id = f.id
      ORDER BY ii.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async findByFarmer(farmerId) {
    const query = `
      SELECT ii.*, f.full_name as farmer_name
      FROM input_invoices ii
      JOIN farmers f ON ii.farmer_id = f.id
      WHERE ii.farmer_id = $1
      ORDER BY ii.created_at DESC
    `;
    const result = await pool.query(query, [farmerId]);
    return result.rows;
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE input_invoices 
      SET status = $1, updated_at = NOW()
      WHERE id = $2 
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async getOutstandingBalance(farmerId) {
    const query = `
      SELECT COALESCE(SUM(total_amount), 0) as total_outstanding
      FROM input_invoices
      WHERE farmer_id = $1 AND status = 'pending'
    `;
    const result = await pool.query(query, [farmerId]);
    return result.rows[0].total_outstanding;
  }

  static async delete(id) {
    const query = 'DELETE FROM input_invoices WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = InputInvoice;