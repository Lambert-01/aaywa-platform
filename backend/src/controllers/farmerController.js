const Farmer = require('../models/Farmer');
const User = require('../models/User');

const farmerController = {
  // Create new farmer
  createFarmer: async (req, res) => {
    try {
      const {
        full_name, phone, cohort_id, vsla_id, date_of_birth,
        household_type, location_coordinates, location_address,
        plot_size, crops, photo_url
      } = req.body;

      // Check if phone already exists
      const existingFarmer = await require('../config/database').query('SELECT id FROM farmers WHERE phone = $1', [phone]);
      if (existingFarmer.rows.length > 0) {
        return res.status(400).json({ error: 'Farmer with this phone number already exists' });
      }

      // Create farmer profile directly
      const farmer = await Farmer.create({
        full_name,
        phone,
        cohort_id,
        vsla_id,
        date_of_birth,
        household_type,
        location_coordinates, // Expected 'POINT(lng lat)'
        location_address,
        plot_size,
        crops,
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

  // Update farmer
  updateFarmer: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

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