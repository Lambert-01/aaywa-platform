const pool = require('../config/database');

class Compost {
  // Compost Batches
  static async createBatch(batchData) {
    const { batch_number, production_date, quantity_kg, quality_score, produced_by } = batchData;
    const query = `
      INSERT INTO compost_batches (batch_number, production_date, quantity_kg, quality_score, produced_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [batch_number, production_date, quantity_kg, quality_score, produced_by];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findBatchById(id) {
    const query = `
      SELECT cb.*, u.full_name as producer_name
      FROM compost_batches cb
      LEFT JOIN users u ON cb.produced_by = u.id
      WHERE cb.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findAllBatches() {
    const query = `
      SELECT cb.*, u.full_name as producer_name
      FROM compost_batches cb
      LEFT JOIN users u ON cb.produced_by = u.id
      ORDER BY cb.production_date DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async updateBatch(id, updateData) {
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

    const query = `UPDATE compost_batches SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Workdays for casual workers
  static async createWorkday(workdayData) {
    const { worker_id, batch_id, date_worked, hours_worked, daily_wage, payment_status } = workdayData;
    const query = `
      INSERT INTO compost_workdays (worker_id, batch_id, date_worked, hours_worked, daily_wage, payment_status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [worker_id, batch_id, date_worked, hours_worked, daily_wage || 2500, payment_status || 'pending'];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findWorkdaysByBatch(batchId) {
    const query = `
      SELECT cw.*, u.full_name as worker_name, u.phone as worker_phone
      FROM compost_workdays cw
      JOIN users u ON cw.worker_id = u.id
      WHERE cw.batch_id = $1
      ORDER BY cw.date_worked DESC
    `;
    const result = await pool.query(query, [batchId]);
    return result.rows;
  }

  static async findWorkdaysByWorker(workerId) {
    const query = `
      SELECT cw.*, cb.batch_number
      FROM compost_workdays cw
      JOIN compost_batches cb ON cw.batch_id = cb.id
      WHERE cw.worker_id = $1
      ORDER BY cw.date_worked DESC
    `;
    const result = await pool.query(query, [workerId]);
    return result.rows;
  }

  static async updateWorkdayPayment(id, paymentStatus, paymentReference) {
    const query = `
      UPDATE compost_workdays 
      SET payment_status = $1, payment_reference = $2, paid_at = NOW()
      WHERE id = $3 
      RETURNING *
    `;
    const result = await pool.query(query, [paymentStatus, paymentReference, id]);
    return result.rows[0];
  }

  static async getPendingPayments() {
    const query = `
      SELECT cw.*, u.full_name as worker_name, u.phone as worker_phone, cb.batch_number
      FROM compost_workdays cw
      JOIN users u ON cw.worker_id = u.id
      JOIN compost_batches cb ON cw.batch_id = cb.id
      WHERE cw.payment_status = 'pending'
      ORDER BY cw.date_worked ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getStipendSummary() {
    const query = `
      SELECT 
        COUNT(*) as total_workdays,
        COALESCE(SUM(daily_wage), 0) as total_wages,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN daily_wage ELSE 0 END), 0) as paid_wages,
        COALESCE(SUM(CASE WHEN payment_status = 'pending' THEN daily_wage ELSE 0 END), 0) as pending_wages
      FROM compost_workdays
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }

  // Feedstock Management
  static async addFeedstockItem(batchId, feedstockData) {
    const { material_type, percentage, kg_amount, cost_per_kg } = feedstockData;
    const query = `
      INSERT INTO compost_feedstock_items (batch_id, material_type, percentage, kg_amount, cost_per_kg)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [batchId, material_type, percentage, kg_amount, cost_per_kg || 0];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getFeedstockItems(batchId) {
    const query = `
      SELECT * FROM compost_feedstock_items
      WHERE batch_id = $1
      ORDER BY percentage DESC
    `;
    const result = await pool.query(query, [batchId]);
    return result.rows;
  }

  static async deleteFeedstockItem(id) {
    const query = `DELETE FROM compost_feedstock_items WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Quality Metrics
  static async updateQualityMetrics(batchId, metricsData) {
    const { moisture, maturity_score, particle_size, notes, temperature } = metricsData;

    // Update batch quality score
    let updateFields = [];
    let values = [];
    let paramIndex = 1;

    if (maturity_score !== undefined) {
      updateFields.push(`quality_score = $${paramIndex}`);
      values.push(maturity_score);
      paramIndex++;
    }

    // Add temperature to log
    if (temperature !== undefined) {
      updateFields.push(`temperature_log = COALESCE(temperature_log, '[]'::jsonb) || $${paramIndex}::jsonb`);
      values.push(JSON.stringify([{ date: new Date().toISOString(), temperature }]));
      paramIndex++;
    }

    // Add moisture to readings
    if (moisture !== undefined) {
      updateFields.push(`moisture_readings = COALESCE(moisture_readings, '[]'::jsonb) || $${paramIndex}::jsonb`);
      values.push(JSON.stringify([{ date: new Date().toISOString(), moisture }]));
      paramIndex++;
    }

    // Update status based on maturity score
    if (maturity_score >= 8) {
      updateFields.push(`status = $${paramIndex}`);
      values.push('Mature');
      paramIndex++;
    }

    values.push(batchId);

    if (updateFields.length === 0) return null;

    const query = `
      UPDATE compost_batches 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Sales Management
  static async createSale(saleData) {
    const { batch_id, buyer_name, buyer_contact, kg_sold, price_per_kg, sale_date, payment_method, created_by } = saleData;
    const query = `
      INSERT INTO compost_sales 
      (batch_id, buyer_name, buyer_contact, kg_sold, price_per_kg, sale_date, payment_method, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [batch_id, buyer_name, buyer_contact, kg_sold, price_per_kg, sale_date, payment_method || 'Mobile Money', created_by];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getSalesByBatch(batchId) {
    const query = `
      SELECT cs.*, u.full_name as created_by_name
      FROM compost_sales cs
      LEFT JOIN users u ON cs.created_by = u.id
      WHERE cs.batch_id = $1
      ORDER BY cs.sale_date DESC
    `;
    const result = await pool.query(query, [batchId]);
    return result.rows;
  }

  static async getAllSales() {
    const query = `
      SELECT cs.*, cb.batch_number, u.full_name as created_by_name
      FROM compost_sales cs
      JOIN compost_batches cb ON cs.batch_id = cb.id
      LEFT JOIN users u ON cs.created_by = u.id
      ORDER BY cs.sale_date DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Enhanced Summary Statistics
  static async getSummaryStats() {
    const query = `
      SELECT 
        COUNT(*) as total_batches,
        COUNT(*) FILTER (WHERE status != 'Sold') as active_batches,
        COALESCE(SUM(quantity_kg), 0) as total_kg_produced,
        COALESCE(AVG(quality_score), 0) as avg_quality_score,
        (
          SELECT COALESCE(SUM(daily_wage), 0)
          FROM compost_workdays
          WHERE payment_status = 'paid'
        ) as total_stipends_paid,
        (
          SELECT COALESCE(SUM(quantity_kg), 0) - COALESCE(SUM(cs.kg_sold), 0)
          FROM compost_batches cb
          LEFT JOIN compost_sales cs ON cb.id = cs.batch_id
          WHERE cb.status = 'Mature'
        ) as surplus_kg_for_sale,
        (
          SELECT COALESCE(AVG(total_cost / NULLIF(quantity_kg, 0)), 0)
          FROM (
            SELECT 
              cb.id,
              cb.quantity_kg,
              COALESCE(SUM(cfi.kg_amount * cfi.cost_per_kg), 0) + COALESCE(SUM(cw.daily_wage), 0) as total_cost
            FROM compost_batches cb
            LEFT JOIN compost_feedstock_items cfi ON cfi.batch_id = cb.id
            LEFT JOIN compost_workdays cw ON cw.batch_id = cb.id
            WHERE cb.quantity_kg > 0
            GROUP BY cb.id, cb.quantity_kg
          ) costs
        ) as cost_per_kg
      FROM compost_batches
    `;
    const result = await pool.query(query);
    const stats = result.rows[0];

    if (!stats) return null;

    return {
      ...stats,
      total_batches: Number(stats.total_batches),
      active_batches: Number(stats.active_batches),
      total_kg_produced: Number(stats.total_kg_produced),
      avg_quality_score: Number(stats.avg_quality_score),
      total_stipends_paid: Number(stats.total_stipends_paid),
      surplus_kg_for_sale: Number(stats.surplus_kg_for_sale),
      cost_per_kg: Number(stats.cost_per_kg)
    };
  }

  // Use database view for comprehensive batch data
  static async findAllBatchesWithDetails() {
    const query = `SELECT * FROM compost_batch_summary ORDER BY production_date DESC`;
    const result = await pool.query(query);
    return result.rows;
  }

  static async findBatchWithDetails(id) {
    const query = `SELECT * FROM compost_batch_summary WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Compost;