const Farmer = require('../models/Farmer');
const User = require('../models/User');

const farmerController = {
  // Create new farmer
  createFarmer: async (req, res) => {
    try {
      const {
        cohort_id,
        vsla_id,
        full_name,
        phone,
        date_of_birth,
        gender,
        household_type,
        latitude,  // Will convert to location_coordinates JSON
        longitude,
        plot_size_hectares,
        crops,
        co_crops,
        photo_url
      } = req.body;

      // Create location_coordinates as JSON if lat/lng provided
      let location_coordinates = null;
      if (latitude && longitude) {
        location_coordinates = JSON.stringify({ lat: parseFloat(latitude), lng: parseFloat(longitude) });
      }

      // Create farmer profile
      const farmer = await Farmer.create({
        cohort_id,
        vsla_id,
        full_name,
        phone,
        date_of_birth,
        gender,
        household_type,
        location_coordinates,
        plot_size_hectares,
        crops,
        co_crops,
        photo_url
      });

      res.status(201).json({
        message: 'Farmer created successfully',
        farmer
      });
    } catch (error) {
      console.error('Create farmer error:', error);
      res.status(500).json({ error: 'Failed to create farmer' });
    }
  },

  // Create batch farmers
  createBatchFarmers: async (req, res) => {
    try {
      const { farmers } = req.body;
      if (!Array.isArray(farmers)) {
        return res.status(400).json({ error: 'Farmers must be an array' });
      }

      const results = [];
      const errors = [];

      for (const farmerData of farmers) {
        try {
          // Map fields from mobile sync if necessary
          const mappedData = {
            full_name: farmerData.name || farmerData.full_name,
            phone: farmerData.phone,
            plot_size_hectares: farmerData.land_size || farmerData.plot_size_hectares,
            // national_id is in the sync spec but not specifically in Farmer.js create? 
            // It might be in the schema as 'national_id' or 'phone' is used.
            // Let's assume for now we only map what's in the model.
            cohort_id: farmerData.cohort_id,
            vsla_id: farmerData.vsla_id,
          };

          const farmer = await Farmer.create(mappedData);
          results.push(farmer);
        } catch (e) {
          console.error('Batch farmer item error:', e.message);
          errors.push({ data: farmerData, error: e.message });
        }
      }

      res.status(207).json({
        message: 'Batch farmers processing complete',
        processedCount: results.length,
        failedCount: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      console.error('Create batch farmers error:', error);
      res.status(500).json({ error: 'Failed to process batch farmers' });
    }
  },

  // Get all farmers
  getAllFarmers: async (req, res) => {
    try {
      const farmers = await Farmer.findAll();
      res.json(farmers);
    } catch (error) {
      console.error('Get farmers error:', error);
      res.status(500).json({ error: 'Failed to fetch farmers' });
    }
  },

  // Get farmer by ID
  getFarmerById: async (req, res) => {
    try {
      const { id } = req.params;
      const farmer = await Farmer.findById(id);

      if (!farmer) {
        return res.status(404).json({ error: 'Farmer not found' });
      }

      res.json(farmer);
    } catch (error) {
      console.error('Get farmer error:', error);
      res.status(500).json({ error: 'Failed to fetch farmer' });
    }
  },

  // Get farmer profile (for logged-in farmer) - Comprehensive
  getMyProfile: async (req, res) => {
    try {
      const db = require('../config/database');
      // Use farmer_id from the token (injected by auth middleware from user record)
      const farmerId = req.user.farmer_id;

      if (!farmerId) {
        return res.status(404).json({ error: 'Farmer profile not found for this user' });
      }

      // 1. Get core farmer info
      const farmerQuery = `
        SELECT f.*, 
               c.name as cohort_name, v.name as vsla_name,
               f.photo_url as profile_url -- Alias for consistency with auth user
        FROM farmers f
        LEFT JOIN cohorts c ON f.cohort_id = c.id
        LEFT JOIN vsla_groups v ON f.vsla_id = v.id
        WHERE f.id = $1
      `;
      const farmerResult = await db.query(farmerQuery, [farmerId]);

      if (farmerResult.rows.length === 0) {
        return res.status(404).json({ error: 'Farmer profile not found' });
      }

      const farmer = farmerResult.rows[0];

      // 2. Get financial metrics
      // VSLA Balance
      const vslaRes = await db.query(
        'SELECT current_balance FROM vsla_members WHERE farmer_id = $1',
        [farmerId]
      );
      const vsla_balance = vslaRes.rows.length > 0 ? parseFloat(vslaRes.rows[0].current_balance) : 0;

      // Input Debt
      const debtRes = await db.query(
        "SELECT COALESCE(SUM(total_cost), 0) as total_debt FROM input_invoices WHERE farmer_id = $1 AND payment_status = 'pending'",
        [farmerId]
      );
      const input_debt = parseFloat(debtRes.rows[0].total_debt);

      // Total Sales
      const salesRes = await db.query(
        'SELECT COALESCE(SUM(gross_revenue), 0) as total_revenue FROM sales WHERE farmer_id = $1',
        [farmerId]
      );
      const total_sales = parseFloat(salesRes.rows[0].total_revenue);

      // 3. Get recent activities (last 5)
      const activityQuery = `
        (SELECT 'sale' as type, gross_revenue as amount, sale_date as date, crop_type as description 
         FROM sales WHERE farmer_id = $1)
        UNION ALL
        (SELECT 'invoice' as type, total_cost as amount, created_at as date, input_type as description 
         FROM input_invoices WHERE farmer_id = $1)
        UNION ALL
        (SELECT 'training' as type, 0 as amount, date, title as description
         FROM training_sessions ts
         JOIN training_attendance ta ON ts.id = ta.session_id
         WHERE ta.farmer_id = $1 AND ta.attendance_status = 'present')
        ORDER BY date DESC LIMIT 5
      `;
      const activityRes = await db.query(activityQuery, [farmerId]);

      const recent_activities = activityRes.rows.map(a => ({
        type: a.type,
        amount: parseFloat(a.amount),
        date: a.date,
        description: a.description
      }));

      // 4. Get real training history
      const trainingQuery = `
        SELECT ts.title, ta.attendance_status as status, ts.date
        FROM training_attendance ta
        JOIN training_sessions ts ON ta.session_id = ts.id
        WHERE ta.farmer_id = $1
        ORDER BY ts.date DESC
      `;
      const trainingRes = await db.query(trainingQuery, [farmerId]);

      // 5. Combine everything
      res.json({
        ...farmer,
        vsla_balance,
        input_debt,
        total_sales,
        trust_score: parseFloat(farmer.trust_score || 85),
        recent_activities,
        completed_trainings: trainingRes.rows
      });
    } catch (error) {
      console.error('Get my profile error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  },

  // Get farmer badges
  getFarmerBadges: async (req, res) => {
    try {
      // Return empty array until real badge logic is implemented
      const badges = [];

      res.json(badges);
    } catch (error) {
      console.error('Get farmer badges error:', error);
      res.status(500).json({ error: 'Failed to fetch farmer badges' });
    }
  },

  // Get farmer profile by ID (comprehensive for profile screen)
  getFarmerProfileById: async (req, res) => {
    try {
      const { id } = req.params;
      const db = require('../config/database');

      // 1. Get core farmer info
      const farmerQuery = `
        SELECT f.*, 
               c.name as cohort_name, v.name as vsla_name,
               f.photo_url as profile_url -- Alias for consistency with auth user
        FROM farmers f
        LEFT JOIN cohorts c ON f.cohort_id = c.id
        LEFT JOIN vsla_groups v ON f.vsla_id = v.id
        WHERE f.id = $1
      `;
      const farmerResult = await db.query(farmerQuery, [id]);

      if (farmerResult.rows.length === 0) {
        return res.status(404).json({ error: 'Farmer profile not found' });
      }

      const farmer = farmerResult.rows[0];

      // 2. Get financial metrics
      // VSLA Balance
      const vslaRes = await db.query(
        'SELECT current_balance FROM vsla_members WHERE farmer_id = $1',
        [id]
      );
      const vsla_balance = vslaRes.rows.length > 0 ? parseFloat(vslaRes.rows[0].current_balance) : 0;

      // Input Debt
      const debtRes = await db.query(
        "SELECT COALESCE(SUM(total_cost), 0) as total_debt FROM input_invoices WHERE farmer_id = $1 AND payment_status = 'pending'",
        [id]
      );
      const input_debt = parseFloat(debtRes.rows[0].total_debt);

      // Total Sales
      const salesRes = await db.query(
        'SELECT COALESCE(SUM(gross_revenue), 0) as total_revenue FROM sales WHERE farmer_id = $1',
        [id]
      );
      const total_sales = parseFloat(salesRes.rows[0].total_revenue);

      // 3. Get recent activities (last 5)
      const activityQuery = `
        (SELECT 'sale' as type, gross_revenue as amount, sale_date as date, crop_type as description 
         FROM sales WHERE farmer_id = $1)
        UNION ALL
        (SELECT 'invoice' as type, total_cost as amount, created_at as date, input_type as description 
         FROM input_invoices WHERE farmer_id = $1)
        UNION ALL
        (SELECT 'training' as type, 0 as amount, date, title as description
         FROM training_sessions ts
         JOIN training_attendance ta ON ts.id = ta.session_id
         WHERE ta.farmer_id = $1 AND ta.attendance_status = 'present')
        ORDER BY date DESC LIMIT 5
      `;
      const activityRes = await db.query(activityQuery, [id]);

      const recent_activities = activityRes.rows.map(a => ({
        type: a.type,
        amount: parseFloat(a.amount),
        date: a.date,
        description: a.description
      }));

      // 4. Get real training history
      const trainingQuery = `
        SELECT ts.title, ta.attendance_status as status, ts.date
        FROM training_attendance ta
        JOIN training_sessions ts ON ta.session_id = ts.id
        WHERE ta.farmer_id = $1
        ORDER BY ts.date DESC
      `;
      const trainingRes = await db.query(trainingQuery, [id]);

      // 5. Combine everything
      res.json({
        ...farmer,
        vsla_balance,
        input_debt,
        total_sales,
        trust_score: parseFloat(farmer.trust_score || 85),
        recent_activities,
        completed_trainings: trainingRes.rows
      });
    } catch (error) {
      console.error('Get farmer profile error:', error);
      res.status(500).json({ error: 'Failed to fetch comprehensive profile' });
    }
  },

  // Update farmer
  updateFarmer: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        latitude,
        longitude,
        plot_boundary, // Can be a WKT string or JSON
        ...rest
      } = req.body;

      const updateData = { ...rest };

      // Sanitize update data: convert empty strings to null (fixes invalid date syntax)
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '') {
          updateData[key] = null;
        }
      });

      // Handle location coordinates update
      if (latitude !== undefined && longitude !== undefined) {
        updateData.location_coordinates = JSON.stringify({ lat: parseFloat(latitude), lng: parseFloat(longitude) });
      }

      if (plot_boundary !== undefined) {
        updateData.plot_boundary = plot_boundary;
      }

      const farmer = await Farmer.update(id, updateData);

      if (!farmer) {
        return res.status(404).json({ error: 'Farmer not found' });
      }

      res.json({
        message: 'Farmer updated successfully',
        farmer
      });
    } catch (error) {
      console.error('Update farmer error:', error);
      res.status(500).json({ error: 'Failed to update farmer' });
    }
  },

  // Update farmer boundary
  updateBoundary: async (req, res) => {
    try {
      const { id } = req.params;
      const { boundary } = req.body; // Expects { boundary: [...] }

      if (!boundary) {
        return res.status(400).json({ error: 'Boundary data is required' });
      }

      // Store as JSON
      const farmer = await Farmer.update(id, {
        plot_boundary: JSON.stringify(boundary)
      });

      if (!farmer) {
        return res.status(404).json({ error: 'Farmer not found' });
      }

      res.json({
        message: 'Boundary updated successfully',
        farmer
      });
    } catch (error) {
      console.error('Update boundary error:', error);
      res.status(500).json({ error: 'Failed to update boundary' });
    }
  },

  // Delete farmer
  deleteFarmer: async (req, res) => {
    try {
      const { id } = req.params;
      const farmer = await Farmer.delete(id);

      if (!farmer) {
        return res.status(404).json({ error: 'Farmer not found' });
      }

      res.json({ message: 'Farmer deleted successfully' });
    } catch (error) {
      console.error('Delete farmer error:', error);
      res.status(500).json({ error: 'Failed to delete farmer' });
    }
  },

  // Get farmers by cohort
  getFarmersByCohort: async (req, res) => {
    try {
      const { cohortId } = req.params;
      const query = `
        SELECT f.*, ST_AsText(f.location_coordinates) as location_coordinates
        FROM farmers f
        WHERE f.cohort_id = $1
      `;
      const result = await require('../config/database').query(query, [cohortId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Get farmers by cohort error:', error);
      res.status(500).json({ error: 'Failed to fetch farmers' });
    }
  },

  /**
   * Calculate and return Trust Score for authenticated farmer
   * GET /api/farmers/me/trust-score
   */
  getTrustScore: async (req, res) => {
    try {
      const db = require('../config/database');
      const farmerId = req.user.farmer_id;

      if (!farmerId) {
        return res.status(400).json({
          error: 'Not a farmer',
          message: 'This endpoint is only available for farmer accounts'
        });
      }

      // 1. VSLA Participation Score
      // 1. VSLA Participation Score
      const vslaResult = await db.query(`
        SELECT 
          COUNT(DISTINCT CAST(transaction_date AS DATE)) as meetings,
          COALESCE(SUM(CASE WHEN transaction_type = 'savings' THEN amount ELSE 0 END), 0) as savings
        FROM vsla_transactions
        WHERE farmer_id = $1
        AND transaction_date >= NOW() - INTERVAL '6 months'
      `, [farmerId]);

      const meetings = parseInt(vslaResult.rows[0]?.meetings || 0);
      const savings = parseFloat(vslaResult.rows[0]?.savings || 0);
      const vslaScore = Math.min(100, (meetings / 24) * 50 + (savings / 100000) * 50);

      // 2. Repayment History Score
      const repaymentResult = await db.query(`
        SELECT 
          COALESCE(SUM(CASE WHEN transaction_type = 'loan_repayment' THEN amount ELSE 0 END), 0) as repayments,
          COALESCE(SUM(CASE WHEN transaction_type = 'loan' THEN amount ELSE 0 END), 0) as loans
        FROM vsla_transactions
        WHERE farmer_id = $1
      `, [farmerId]);

      const repayments = parseFloat(repaymentResult.rows[0]?.repayments || 0);
      const loans = parseFloat(repaymentResult.rows[0]?.loans || 0);
      const repaymentScore = loans > 0 ? (repayments / loans) * 100 : 100; // Default to 100 if no loans

      // 3. Agronomic Performance Score
      const trainingResult = await db.query(`
        SELECT COUNT(DISTINCT session_id) as count
        FROM training_attendance WHERE farmer_id = $1
      `, [farmerId]);

      const salesResult = await db.query(`
        SELECT COALESCE(SUM(quantity_kg), 0) as kg
        FROM sales
        WHERE farmer_id = $1 AND sale_date >= NOW() - INTERVAL '1 year'
      `, [farmerId]);

      const trainings = parseInt(trainingResult.rows[0]?.count || 0);
      const salesKg = parseFloat(salesResult.rows[0]?.kg || 0);
      const agronomicScore = Math.min(100, (trainings / 10) * 40 + (salesKg / 1000) * 60);

      // Calculate final score
      const trustScore = Math.round((vslaScore * 0.4) + (repaymentScore * 0.4) + (agronomicScore * 0.2));

      // Update and save
      await db.query('UPDATE farmers SET trust_score = $1 WHERE id = $2', [trustScore, farmerId]);

      // Only insert history if score changed or periodically (omitted for brevity/stability)
      // await db.query(...) to avoid spamming history on every refresh if needed

      res.json({
        success: true,
        trust_score: trustScore,
        breakdown: {
          vsla: Math.round(vslaScore),
          repayment: Math.round(repaymentScore),
          agronomic: Math.round(agronomicScore)
        }
      });
    } catch (error) {
      console.error('Trust score error:', error);
      // Return 0 score instead of 500 if calculation fails
      res.json({
        success: true,
        trust_score: 0,
        breakdown: { vsla: 0, repayment: 0, agronomic: 0 },
        error: 'Calculation failed, returning default'
      });
    }
  },

  /**
   * Get personalized learning path
   * GET /api/farmers/me/learning-path
   */
  getLearningPath: async (req, res) => {
    try {
      const db = require('../config/database');
      const farmerId = req.user.farmer_id;
      const cohortId = req.user.cohort_id;

      if (!farmerId) {
        return res.status(400).json({ error: 'Not a farmer' });
      }

      let croppingSystem = 'avocado';
      if (cohortId) {
        const cohortRes = await db.query('SELECT cropping_system FROM cohorts WHERE id = $1', [cohortId]);
        if (cohortRes.rows.length > 0) {
          croppingSystem = cohortRes.rows[0].cropping_system || 'avocado';
        }
      }

      const completedRes = await db.query(
        'SELECT DISTINCT t.title as topic FROM training_sessions t INNER JOIN training_attendance a ON t.id = a.session_id WHERE a.farmer_id = $1',
        [farmerId]
      );
      const completed = completedRes.rows.map(r => r.topic);

      const paths = {
        avocado: [
          { topic: 'land_preparation', priority: 1 },
          { topic: 'planting_techniques', priority: 2 },
          { topic: 'irrigation_management', priority: 3 },
          { topic: 'pest_disease_management', priority: 4 },
          { topic: 'harvesting_techniques', priority: 5 }
        ],
        macadamia: [
          { topic: 'land_preparation', priority: 1 },
          { topic: 'grafting_techniques', priority: 2 },
          { topic: 'irrigation_management', priority: 3 },
          { topic: 'harvesting_techniques', priority: 4 }
        ]
      };

      const path = paths[croppingSystem] || paths.avocado;
      const recommendations = path.filter(m => !completed.includes(m.topic)).slice(0, 5);

      res.json({
        success: true,
        cropping_system: croppingSystem,
        completion_percentage: path.length > 0 ? Math.round((completed.length / path.length) * 100) : 0,
        recommendations
      });
    } catch (error) {
      console.error('Learning path error:', error);
      // Return default empty path instead of 500
      res.json({
        success: true,
        cropping_system: 'avocado',
        completion_percentage: 0,
        recommendations: []
      });
    }
  },

  /**
   * Get market intelligence
   * GET /api/farmers/me/market-intel
   */
  getMarketIntel: async (req, res) => {
    try {
      const db = require('../config/database');
      const farmerId = req.user.farmer_id;

      if (!farmerId) return res.status(400).json({ error: 'Not a farmer' });

      const farmerRes = await db.query(
        'SELECT c.cropping_system FROM farmers f LEFT JOIN cohorts c ON f.cohort_id = c.id WHERE f.id = $1',
        [farmerId]
      );
      const cropType = farmerRes.rows[0]?.cropping_system || 'avocado';

      // Ensure market_prices table exists or handle error, but assuming it exists
      const pricesRes = await db.query(
        'SELECT * FROM market_prices WHERE crop_type = $1 AND price_date >= CURRENT_DATE - INTERVAL \'7 days\' ORDER BY quality_grade, price_date DESC',
        [cropType]
      );

      res.json({
        success: true,
        crop_type: cropType,
        current_prices: pricesRes.rows
      });
    } catch (error) {
      console.error('Market intel error:', error);
      res.status(500).json({ error: 'Failed to get market intel' });
    }
  },

  /**
   * Get resource qualification
   * GET /api/farmers/me/resource-qualification
   */
  getResourceQualification: async (req, res) => {
    try {
      const db = require('../config/database');
      const farmerId = req.user.farmer_id;
      const trustScore = req.user.trust_score || 0;

      if (!farmerId) return res.status(400).json({ error: 'Not a farmer' });

      const farmerRes = await db.query(
        'SELECT plot_size_hectares, household_type FROM farmers WHERE id = $1',
        [farmerId]
      );
      const plotSize = parseFloat(farmerRes.rows[0]?.plot_size_hectares) || 0;
      const householdType = farmerRes.rows[0]?.household_type;

      const qualifications = [
        {
          program: 'Input Credit Program',
          qualified: trustScore >= 60 && plotSize >= 0.25,
          requirements: { min_trust_score: 60, min_plot_size: 0.25 }
        },
        {
          program: 'Premium Training',
          qualified: trustScore >= 70,
          requirements: { min_trust_score: 70 }
        }
      ];

      res.json({
        success: true,
        qualifications,
        summary: {
          qualified_programs: qualifications.filter(q => q.qualified).length,
          total_programs: qualifications.length
        }
      });
    } catch (error) {
      console.error('Resource qualification error:', error);
      res.status(500).json({ error: 'Failed to get qualification' });
    }
  }
};

module.exports = farmerController;