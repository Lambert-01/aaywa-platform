const pool = require('../config/database');

class InputInvoice {
  static async create(invoiceData) {
    const { farmer_id, items, total_amount, issued_by, input_type, quantity, unit_price } = invoiceData;
    // Determine input type if not provided, default to 'mixed'
    const type = input_type || 'mixed';
    // Calculate total quantity from items if items provided, else use quantity
    const total_quantity = quantity || (items ? items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0) : 1);
    // Calculate average unit price
    const avg_unit_price = unit_price || (total_quantity > 0 ? (total_amount / total_quantity) : 0);

    const query = `
      INSERT INTO input_invoices (farmer_id, items, total_amount, issued_by, input_type, quantity, unit_price, total_cost)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [farmer_id, JSON.stringify(items || []), total_amount, issued_by, type, total_quantity, avg_unit_price, total_amount];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async createBatch(invoices) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const results = [];
      for (const invoice of invoices) {
        // Map mobile app fields to DB fields
        // Mobile sends: farmer_id, supplier, input_type, quantity, unit_price, total_cost, installments, date, notes
        const { farmer_id, supplier, input_type, quantity, unit_price, total_cost, date, notes } = invoice;

        const query = `
          INSERT INTO input_invoices (
            farmer_id, items, total_amount, issued_by, input_type, quantity, unit_price, total_cost, created_at, status
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
          RETURNING *
        `;
        // We treat 'supplier' as 'issued_by'
        // items is empty array for single-item invoice from mobile
        const values = [
          farmer_id,
          '[]',
          total_cost,
          supplier,
          input_type,
          quantity,
          unit_price,
          total_cost,
          date || new Date()
        ];

        const res = await client.query(query, values);
        results.push(res.rows[0]);
      }
      await client.query('COMMIT');
      return results;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
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