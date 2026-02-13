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

  // Get farmer profile (for logged-in farmer) - DEPRECATED or Adapted
  getMyProfile: async (req, res) => {
    // This assumes specific logic for logged-in users who happened to be linked
    // Since we are moving away from farmers being users, this might return 404
    // or we check if user has a linked farmer record
    try {
      const query = `
        SELECT f.*,

               c.name as cohort_name, v.name as vsla_name
        FROM farmers f
        LEFT JOIN cohorts c ON f.cohort_id = c.id
        LEFT JOIN vsla_groups v ON f.vsla_id = v.id
        WHERE f.user_id = $1
      `;
      const result = await require('../config/database').query(query, [req.user.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Farmer profile not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Get my profile error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
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
               c.name as cohort_name, v.name as vsla_name
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
         WHERE ta.farmer_id = $1 AND ta.status = 'Attended')
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
        SELECT ts.title, ta.status, ts.date
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
  }
};

module.exports = farmerController;