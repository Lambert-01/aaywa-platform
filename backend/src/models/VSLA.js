const pool = require('../config/database');

class VSLA {
  static async create(vslaData) {
    const { cohort_id, name, seed_capital } = vslaData;
    const query = `
      INSERT INTO vsla_groups (cohort_id, name, seed_capital)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [cohort_id, name, seed_capital || 12000];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT v.*, c.name as cohort_name,
             COUNT(vm.id) as member_count
      FROM vsla_groups v
      LEFT JOIN cohorts c ON v.cohort_id = c.id
      LEFT JOIN vsla_members vm ON v.id = vm.vsla_id
      WHERE v.id = $1
      GROUP BY v.id, c.name
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findAll() {
    const query = `
      SELECT v.*, c.name as cohort_name,
             COUNT(vm.id) as member_count
      FROM vsla_groups v
      LEFT JOIN cohorts c ON v.cohort_id = c.id
      LEFT JOIN vsla_members vm ON v.id = vm.vsla_id
      GROUP BY v.id, c.name
      ORDER BY v.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async findByCohort(cohortId) {
    const query = `
      SELECT v.*, COUNT(vm.id) as member_count
      FROM vsla_groups v
      LEFT JOIN vsla_members vm ON v.id = vm.vsla_id
      WHERE v.cohort_id = $1
      GROUP BY v.id
    `;
    const result = await pool.query(query, [cohortId]);
    return result.rows;
  }

  // --- Metrics Aggregation ---
  static async getMetrics(id) {
    if (!id) throw new Error('VSLA ID is required for metrics');

    // Get savings pool & loans from transactions
    const txnQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'savings' THEN amount ELSE 0 END), 0) as total_savings,
        COALESCE(SUM(CASE WHEN type = 'loan_disbursement' THEN amount ELSE 0 END), 0) as total_loans_issued,
        COALESCE(SUM(CASE WHEN type = 'loan_repayment' THEN amount ELSE 0 END), 0) as total_repayments
      FROM vsla_transactions 
      WHERE vsla_id = $1
    `;

    // Get maintenance fund directly from group table
    const groupQuery = `
      SELECT COALESCE(maintenance_fund, 0) as maintenance_fund, seed_capital
      FROM vsla_groups 
      WHERE id = $1
    `;

    // Get active loans count (proxy for now: simplistic)
    // In a real system we'd track loan status more effectively
    const activeLoansQuery = `
        SELECT COUNT(DISTINCT member_id) as active_borrowers
        FROM vsla_transactions
        WHERE vsla_id = $1 AND type = 'loan_disbursement'
    `;

    const [txnRes, groupRes, activeLoansRes] = await Promise.all([
      pool.query(txnQuery, [id]),
      pool.query(groupQuery, [id]),
      pool.query(activeLoansQuery, [id])
    ]);

    const txns = txnRes.rows[0];
    const group = groupRes.rows[0];

    // Calculate current loan portfolio: Issued - Repaid (simplified)
    const active_loan_portfolio = Number(txns.total_loans_issued) - Number(txns.total_repayments);

    return {
      total_savings: Number(txns.total_savings) + Number(group.seed_capital), // Include seed in "pool" perception if desired, or keep separate
      active_loan_portfolio: active_loan_portfolio > 0 ? active_loan_portfolio : 0,
      maintenance_fund: Number(group.maintenance_fund),
      seed_capital: Number(group.seed_capital),
      active_borrowers: Number(activeLoansRes.rows[0].active_borrowers)
    };
  }

  // VSLA Members
  static async addMember(memberData) {
    const { vsla_id, farmer_id, role, opening_savings } = memberData;
    const query = `
      INSERT INTO vsla_members (vsla_id, farmer_id, role, opening_savings, current_balance)
      VALUES ($1, $2, $3, $4, $4)
      RETURNING *
    `;
    const values = [vsla_id, farmer_id, role || 'member', opening_savings || 12000];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getMembers(vslaId) {
    const query = `
      SELECT vm.*, f.id as farmer_id, f.full_name, f.phone
      FROM vsla_members vm
      JOIN farmers f ON vm.farmer_id = f.id
      WHERE vm.vsla_id = $1
      ORDER BY vm.role = 'chair' DESC, vm.role = 'treasurer' DESC
    `;
    const result = await pool.query(query, [vslaId]);
    return result.rows;
  }

  static async getOfficers(vslaId) {
    const query = `
      SELECT vm.*, f.full_name, f.phone
      FROM vsla_members vm
      JOIN farmers f ON vm.farmer_id = f.id
      WHERE vm.vsla_id = $1 AND vm.role IN ('chair', 'treasurer', 'secretary', 'loan_officer')
    `;
    const result = await pool.query(query, [vslaId]);
    return result.rows;
  }

  static async rotateOfficer(id, newRole) {
    const query = `UPDATE vsla_members SET role = $1 WHERE id = $2 RETURNING *`;
    const result = await pool.query(query, [newRole, id]);
    return result.rows[0];
  }

  // VSLA Transactions
  static async createTransaction(transactionData) {
    const {
      vsla_id, member_id, type, amount, description,
      repayment_date, interest_rate, work_type, days_worked,
      vendor_name, receipt_url, sale_reference
    } = transactionData;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Insert Transaction
      const txnQuery = `
        INSERT INTO vsla_transactions (
          vsla_id, member_id, type, amount, description,
          repayment_date, interest_rate, work_type, days_worked,
          vendor_name, receipt_url, sale_reference
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;
      const values = [
        vsla_id, member_id, type, amount, description,
        repayment_date, interest_rate, work_type, days_worked,
        vendor_name, receipt_url, sale_reference
      ];

      const txnResult = await client.query(txnQuery, values);
      const transaction = txnResult.rows[0];

      // 2. Update Member Balance (if applicable)
      if (member_id && (type === 'savings' || type === 'loan_repayment')) {
        await client.query(`
              UPDATE vsla_members 
              SET current_balance = current_balance + $1 
              WHERE id = $2
          `, [amount, member_id]);
      } else if (member_id && type === 'loan_disbursement') {
        // Loan disbursement might NOT reduce savings balance directly depending on model, 
        // but for simple accounting we might just track it. 
        // Project AAYWA spec says "one-off seed injection", so loans come from the pool.
      }

      // 3. Update Group Maintenance Fund (if applicable)
      if (type === 'maintenance_expense') {
        await client.query(`
              UPDATE vsla_groups
              SET maintenance_fund = maintenance_fund - $1
              WHERE id = $2
          `, [amount, vsla_id]);
      }

      await client.query('COMMIT');
      return transaction;

    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  static async getMemberFinancialSummary(vslaId) {
    const query = `
      SELECT * FROM vsla_member_financial_summary
      WHERE vsla_id = $1
      ORDER BY full_name ASC
    `;
    const result = await pool.query(query, [vslaId]);
    return result.rows;
  }

  static async getTransactions(vslaId) {
    const query = `
      SELECT vt.*, f.full_name as member_name
      FROM vsla_transactions vt
      LEFT JOIN vsla_members vm ON vt.member_id = vm.id
      LEFT JOIN farmers f ON vm.farmer_id = f.id
      WHERE vt.vsla_id = $1
      ORDER BY vt.created_at DESC
    `;
    const result = await pool.query(query, [vslaId]);
    return result.rows;
  }
}

module.exports = VSLA;