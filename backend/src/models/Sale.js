const pool = require('../config/database');

class Sale {
  static async create(saleData) {
    const { 
      farmer_id, 
      input_invoice_id, 
      crop_type, 
      quantity, 
      unit_price,
      gross_revenue,
      input_cost,
      net_revenue,
      farmer_share,
      sanza_share,
      buyer_id
    } = saleData;

    const query = `
      INSERT INTO sales (
        farmer_id, input_invoice_id, crop_type, quantity, unit_price,
        gross_revenue, input_cost, net_revenue, farmer_share, sanza_share, buyer_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const values = [
      farmer_id, input_invoice_id, crop_type, quantity, unit_price,
      gross_revenue, input_cost, net_revenue, farmer_share, sanza_share, buyer_id
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT s.*, 
             u.full_name as farmer_name,
             u2.full_name as buyer_name
      FROM sales s
      JOIN farmers f ON s.farmer_id = f.id
      JOIN users u ON f.user_id = u.id
      LEFT JOIN users u2 ON s.buyer_id = u2.id
      WHERE s.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findAll() {
    const query = `
      SELECT s.*, 
             u.full_name as farmer_name,
             u2.full_name as buyer_name
      FROM sales s
      JOIN farmers f ON s.farmer_id = f.id
      JOIN users u ON f.user_id = u.id
      LEFT JOIN users u2 ON s.buyer_id = u2.id
      ORDER BY s.sale_date DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async findByFarmer(farmerId) {
    const query = `
      SELECT s.*, u.full_name as farmer_name
      FROM sales s
      JOIN farmers f ON s.farmer_id = f.id
      JOIN users u ON f.user_id = u.id
      WHERE s.farmer_id = $1
      ORDER BY s.sale_date DESC
    `;
    const result = await pool.query(query, [farmerId]);
    return result.rows;
  }

  static async getSalesSummary(farmerId) {
    const query = `
      SELECT 
        COALESCE(SUM(gross_revenue), 0) as total_gross,
        COALESCE(SUM(input_cost), 0) as total_input_cost,
        COALESCE(SUM(net_revenue), 0) as total_net,
        COALESCE(SUM(farmer_share), 0) as total_farmer_share,
        COALESCE(SUM(sanza_share), 0) as total_sanza_share
      FROM sales
      WHERE farmer_id = $1
    `;
    const result = await pool.query(query, [farmerId]);
    return result.rows[0];
  }

  static async getKPIs() {
    const query = `
      SELECT 
        COUNT(*) as total_sales,
        COALESCE(SUM(gross_revenue), 0) as total_revenue,
        COALESCE(SUM(net_revenue), 0) as total_net,
        COALESCE(SUM(farmer_share), 0) as total_farmer_share,
        COALESCE(SUM(sanza_share), 0) as total_sanza_share
      FROM sales
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM sales WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Sale;