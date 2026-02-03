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
}

module.exports = Compost;