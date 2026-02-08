const Cohort = require('../models/Cohort');
const pool = require('../config/database');

const cohortController = {
  // Create new cohort
  createCohort: async (req, res) => {
    try {
      // Pass full body - model handles extraction and validation
      const cohort = await Cohort.create(req.body);

      res.status(201).json({
        message: 'Cohort created successfully',
        cohort
      });
    } catch (error) {
      console.error('Create cohort error:', error);
      res.status(500).json({ error: 'Failed to create cohort' });
    }
  },

  // Get all cohorts with high-level metrics
  getAllCohorts: async (req, res) => {
    try {
      // In a real scenario with the materialized view:
      // const query = 'SELECT * FROM cohort_metrics JOIN cohorts ON ...';

      // For now, we'll fetch cohorts and enrich them with standard queries
      const cohorts = await Cohort.findAll();

      // Enrich with calculated metrics (simulating the View logic for compatibility)
      const enrichedCohorts = await Promise.all(cohorts.map(async (cohort) => {
        // Count farmers
        const farmerCountResult = await pool.query('SELECT COUNT(*) as count FROM farmers WHERE cohort_id = $1', [cohort.id]);
        const farmerCount = parseInt(farmerCountResult.rows[0].count) || 0;

        // 1. Yield (Avg Yield) -> Using Products table as proxy for harvest/yield
        // We calculate yield as sum of available_quantity + sold quantity (if tracked)
        // For now, we'll use available_quantity from products table

        // A. All-time Average (Main Display Value)
        const yieldRes = await pool.query('SELECT AVG(available_quantity) as val FROM products WHERE cohort_id = $1', [cohort.id]);
        const avgYield = Math.round(parseFloat(yieldRes.rows[0].val) || 0);

        // B. Trend Analysis (Current Month vs Last Month)
        const currYieldRes = await pool.query(`
            SELECT AVG(available_quantity) as val 
            FROM products 
            WHERE cohort_id = $1 
            AND harvest_date >= date_trunc('month', CURRENT_DATE)
        `, [cohort.id]);

        const prevYieldRes = await pool.query(`
            SELECT AVG(available_quantity) as val 
            FROM products 
            WHERE cohort_id = $1 
            AND harvest_date >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
            AND harvest_date < date_trunc('month', CURRENT_DATE)
        `, [cohort.id]);

        const currentMonthYield = parseFloat(currYieldRes.rows[0].val) || 0;
        const lastMonthYield = parseFloat(prevYieldRes.rows[0].val) || 0;

        let yieldTrend = 0;
        if (lastMonthYield > 0) {
          yieldTrend = Math.round(((currentMonthYield - lastMonthYield) / lastMonthYield) * 100);
        } else if (currentMonthYield > 0) {
          yieldTrend = 100; // 100% increase if starting from 0
        }

        // C. Dynamic Target (e.g., +20% of last month's yield, or default 500)
        const yieldTarget = lastMonthYield > 0 ? Math.round(lastMonthYield * 1.2) : 500;

        // 2. Repayment Rate (Repaid Amount / Disbursed Amount)
        // Using vsla_transactions as source of truth
        const repayRes = await pool.query(`
          SELECT 
            SUM(CASE WHEN type = 'loan_repayment' THEN amount ELSE 0 END) as total_repaid,
            SUM(CASE WHEN type = 'loan_disbursement' THEN amount ELSE 0 END) as total_disbursed
          FROM vsla_transactions
          WHERE member_id IN (SELECT id FROM vsla_members WHERE farmer_id IN (SELECT id FROM farmers WHERE cohort_id = $1))
        `, [cohort.id]);

        const totalRepaid = parseFloat(repayRes.rows[0].total_repaid) || 0;
        const totalDisbursed = parseFloat(repayRes.rows[0].total_disbursed) || 0;
        const repayRate = totalDisbursed > 0
          ? Math.round((totalRepaid / totalDisbursed) * 100)
          : 0;

        // 3. Attendance Rate
        const attRes = await pool.query(`
          SELECT 
            COUNT(*) filter (where attendance_status = 'present') as present_count,
            COUNT(*) as total_count
          FROM training_attendance
          WHERE farmer_id IN (SELECT id FROM farmers WHERE cohort_id = $1)
        `, [cohort.id]);

        const realAttRate = attRes.rows[0].total_count > 0
          ? Math.round((parseInt(attRes.rows[0].present_count) / parseInt(attRes.rows[0].total_count)) * 100)
          : 0;


        // 4. Avg Income (Revenue)
        const salesRes = await pool.query('SELECT AVG(gross_revenue) as val FROM sales WHERE farmer_id IN (SELECT id FROM farmers WHERE cohort_id = $1)', [cohort.id]);
        const avgIncome = parseFloat(salesRes.rows[0].val) || 0;

        // 5. Post-Harvest Loss (Proxy: Products marked as 'deleted' / Total Products)
        // In a real system, we'd have a specific 'waste' log or status.
        // For now, we'll assume 'deleted' status roughly correlates to unsold/lost inventory if tracking strictly.
        // Or simply 0 if no data to avoid scary 8% hardcode.
        const lossRes = await pool.query(`
            SELECT 
                COUNT(*) filter (where status = 'deleted') as lost_count,
                COUNT(*) as total_count
            FROM products
            WHERE cohort_id = $1
        `, [cohort.id]);

        const lossRate = lossRes.rows[0].total_count > 0
          ? Math.round((parseInt(lossRes.rows[0].lost_count) / parseInt(lossRes.rows[0].total_count)) * 100)
          : 0;

        // 6. VSLA Health Score (Weighted Metric)
        // Formula: 50% Repayment Rate + 30% Attendance Rate + 20% Group Activity (Active Farmers)
        // Normalize Active Farmers: if > 10 farmers, full 20 points.
        const activityScore = Math.min(farmerCount, 10) * 2;

        const vslaHealth = Math.round(
          (repayRate * 0.5) +
          (realAttRate * 0.3) +
          (activityScore)
        );

        return {
          ...cohort,
          farmerCount: farmerCount,
          performance: {
            yieldIncrease: avgYield, // Using avg yield as the metric for now
            yieldTrend: yieldTrend,
            yieldTarget: yieldTarget,
            repaymentRate: repayRate,
            attendanceRate: realAttRate,
            avgIncome: avgIncome,
            postHarvestLoss: lossRate,
            vslaScore: vslaHealth
          }
        };
      }));

      res.json(enrichedCohorts);
    } catch (error) {
      console.error('Get cohorts error:', error);
      res.status(500).json({ error: 'Failed to fetch cohorts' });
    }
  },

  // Get cohort by ID
  getCohortById: async (req, res) => {
    try {
      const { id } = req.params;
      const cohort = await Cohort.findById(id);

      if (!cohort) {
        return res.status(404).json({ error: 'Cohort not found' });
      }

      // Get farmer count
      const farmerQuery = 'SELECT COUNT(*) as farmer_count FROM farmers WHERE cohort_id = $1';
      const farmerResult = await pool.query(farmerQuery, [id]);

      res.json({
        ...cohort,
        farmer_count: parseInt(farmerResult.rows[0].farmer_count)
      });
    } catch (error) {
      console.error('Get cohort error:', error);
      res.status(500).json({ error: 'Failed to fetch cohort' });
    }
  },

  // Update cohort
  updateCohort: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const cohort = await Cohort.update(id, updateData);

      if (!cohort) {
        return res.status(404).json({ error: 'Cohort not found' });
      }

      res.json({
        message: 'Cohort updated successfully',
        cohort
      });
    } catch (error) {
      console.error('Update cohort error:', error);
      res.status(500).json({ error: 'Failed to update cohort' });
    }
  },

  // Delete cohort
  deleteCohort: async (req, res) => {
    try {
      const { id } = req.params;
      const cohort = await Cohort.delete(id);

      if (!cohort) {
        return res.status(404).json({ error: 'Cohort not found' });
      }

      res.json({ message: 'Cohort deleted successfully' });
    } catch (error) {
      console.error('Delete cohort error:', error);
      res.status(500).json({ error: 'Failed to delete cohort' });
    }
  },

  // [NEW] Get Aggregated Metrics for a specific cohort
  getCohortMetrics: async (req, res) => {
    const { id } = req.params;
    try {
      // 1. Yield (Average Yield per record) -> Using Products table
      const yieldQuery = `
        SELECT AVG(available_quantity) as current_yield 
        FROM products
        WHERE cohort_id = $1
      `;
      const yieldRes = await pool.query(yieldQuery, [id]);
      const currentYield = parseFloat(yieldRes.rows[0].current_yield) || 0;

      // 2. Repayment (Repaid / Disbursed) -> Using vsla_transactions
      const repaymentQuery = `
          SELECT 
            SUM(CASE WHEN type = 'loan_repayment' THEN amount ELSE 0 END) as total_repaid,
            SUM(CASE WHEN type = 'loan_disbursement' THEN amount ELSE 0 END) as total_disbursed
          FROM vsla_transactions
          WHERE member_id IN (SELECT id FROM vsla_members WHERE farmer_id IN (SELECT id FROM farmers WHERE cohort_id = $1))
      `;
      const repayRes = await pool.query(repaymentQuery, [id]);
      const totalRepaid = parseFloat(repayRes.rows[0].total_repaid) || 0;
      const totalDisbursed = parseFloat(repayRes.rows[0].total_disbursed) || 0;
      const repaymentRate = totalDisbursed > 0 ? Math.round((totalRepaid / totalDisbursed) * 100) : 0;

      // 3. Attendance
      const attendanceQuery = `
        SELECT 
          COUNT(*) filter (where attendance_status = 'present') as present_count,
          COUNT(*) as total_count
        FROM training_attendance
        WHERE farmer_id IN (SELECT id FROM farmers WHERE cohort_id = $1)
      `;
      const attRes = await pool.query(attendanceQuery, [id]);
      const totalAtt = parseInt(attRes.rows[0].total_count) || 0;
      const presentAtt = parseInt(attRes.rows[0].present_count) || 0;
      const attendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0;

      // 4. Financials (Revenue from sales & Expenses from Invoices)
      let revenue = 0;
      let expenses = 0;
      try {
        const salesQuery = `
            SELECT SUM(gross_revenue) as revenue 
            FROM sales 
            WHERE farmer_id IN (SELECT id FROM farmers WHERE cohort_id = $1)
          `;
        const salesRes = await pool.query(salesQuery, [id]);
        revenue = parseFloat(salesRes.rows[0].revenue) || 0;

        const expenseQuery = `
            SELECT SUM(total_amount) as expenses
            FROM input_invoices
            WHERE farmer_id IN (SELECT id FROM farmers WHERE cohort_id = $1)
        `;
        const expenseRes = await pool.query(expenseQuery, [id]);
        expenses = parseFloat(expenseRes.rows[0].expenses) || 0;
      } catch (e) {
        console.warn('Financial query failed', e.message);
      }

      // 5. Agronomy (Crops & Harvests)
      let agronomyData = { crops: [], recentHarvests: [] };
      try {
        const cropsQuery = `SELECT DISTINCT crop_name FROM products WHERE cohort_id = $1 LIMIT 5`;
        const cropRes = await pool.query(cropsQuery, [id]);

        const harvestQuery = `
            SELECT p.crop_name, p.harvest_date, p.available_quantity as quantity, p.quality_grade, f.full_name as farmer_name
            FROM products p
            JOIN farmers f ON p.farmer_id = f.id
            WHERE p.cohort_id = $1
            ORDER BY p.harvest_date DESC
            LIMIT 5
          `;
        const harvestRes = await pool.query(harvestQuery, [id]);
        agronomyData = {
          crops: cropRes.rows.map(r => r.crop_name),
          recentHarvests: harvestRes.rows
        };
      } catch (e) { console.warn('Agronomy query failed', e.message); }

      // 6. Training (Recent Sessions)
      let trainingData = { sessions: [] };
      try {
        // Check if training_sessions table exists, otherwise fallback or empty
        const trainingQuery = `
            SELECT title as topic, date, actual_attendees as attendees, status
            FROM training_sessions
            WHERE cohort_id = $1
            ORDER BY date DESC
            LIMIT 5
          `;
        const trainRes = await pool.query(trainingQuery, [id]);
        trainingData.sessions = trainRes.rows;
      } catch (e) { console.warn('Training query failed', e.message); }

      // 7. Logistics (Recent Deliveries/Sales)
      let logisticsData = { deliveries: [] };
      try {
        const logisticsQuery = `
            SELECT s.id, s.buyer_name as buyer, s.quantity_kg as quantity, s.status, s.created_at as date
            FROM sales s
            JOIN farmers f ON s.farmer_id = f.id
            WHERE f.cohort_id = $1
            ORDER BY s.created_at DESC
            LIMIT 5
          `;
        const logRes = await pool.query(logisticsQuery, [id]);
        logisticsData.deliveries = logRes.rows;
      } catch (e) { console.warn('Logistics query failed', e.message); }

      const metrics = {
        yield: { current: currentYield, baseline: 0, target: 100 },
        repayment: { rate: repaymentRate, status: repaymentRate > 80 ? 'Healthy' : 'Warning' },
        attendance: { rate: attendanceRate, sessions: totalAtt },
        financials: {
          revenue: revenue,
          expenses: expenses,
          net: revenue - expenses,
          costs: expenses // Alias for consistency if needed
        },
        agronomy: agronomyData,
        training: trainingData,
        logistics: logisticsData,
        social: {
          teenMothersPct: 0,
          champions: 0,
          peersMentored: 0
        }
      };

      res.json(metrics);
    } catch (error) {
      console.error('Get metrics error:', error);
      res.status(500).json({ error: 'Failed to get cohort metrics' });
    }
  },

  // [NEW] Get Farmers list for a cohort
  getCohortFarmers: async (req, res) => {
    const { id } = req.params;
    try {
      const query = `
        SELECT id, full_name, household_type, 'Farmer' as role, phone as phone_number, plot_size_hectares as plot_size_ha, 
               (location_coordinates->>'lat')::float as location_lat, (location_coordinates->>'lng')::float as location_lng,
               photo_url, date_of_birth
        FROM farmers 
        WHERE cohort_id = $1
        ORDER BY created_at DESC
        LIMIT 50
      `;
      const result = await pool.query(query, [id]);
      res.json(result.rows);
    } catch (error) {
      console.error('Get cohort farmers error:', error);
      res.status(500).json({ error: 'Failed to get cohort farmers' });
    }
  },

  // [NEW] Get VSLA data for a cohort
  getCohortVSLA: async (req, res) => {
    const { id } = req.params;
    try {
      // Mocking VSLA data response structure
      res.json({
        groupName: `VSLA-Cohort${id}`,
        savingsPool: 300000,
        activeLoans: 85000,
        maintenanceFund: 15000,
        healthScore: 94
      });
    } catch (error) {
      console.error('Get VSLA error:', error);
      res.status(500).json({ error: 'Failed to get VSLA data' });
    }
  }
};

module.exports = cohortController;