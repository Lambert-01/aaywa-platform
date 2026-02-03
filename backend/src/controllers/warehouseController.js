const Warehouse = require('../models/Warehouse');
const StorageFeeCalculator = require('../services/storageFeeCalculator');

const warehouseController = {
  // Create new storage facility
  createFacility: async (req, res) => {
    try {
      const { 
        name, 
        type, 
        location_coordinates, 
        capacity_kg, 
        user_fee_per_kg_per_week,
        vsla_id 
      } = req.body;

      const facility = await Warehouse.createFacility({
        name,
        type,
        location_coordinates,
        capacity_kg,
        user_fee_per_kg_per_week,
        vsla_id
      });

      res.status(201).json({
        message: 'Storage facility created successfully',
        facility
      });
    } catch (error) {
      console.error('Create facility error:', error);
      res.status(500).json({ error: 'Failed to create facility' });
    }
  },

  // Get all facilities
  getAllFacilities: async (req, res) => {
    try {
      const facilities = await Warehouse.findAllFacilities();
      res.json(facilities);
    } catch (error) {
      console.error('Get facilities error:', error);
      res.status(500).json({ error: 'Failed to fetch facilities' });
    }
  },

  // Get facility by ID
  getFacilityById: async (req, res) => {
    try {
      const { id } = req.params;
      const facility = await Warehouse.findFacilityById(id);
      
      if (!facility) {
        return res.status(404).json({ error: 'Facility not found' });
      }

      // Get current produce
      const produce = await Warehouse.findProduceByWarehouse(id);

      res.json({
        ...facility,
        current_produce: produce
      });
    } catch (error) {
      console.error('Get facility error:', error);
      res.status(500).json({ error: 'Failed to fetch facility' });
    }
  },

  // Update facility
  updateFacility: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const facility = await Warehouse.updateFacility(id, updateData);
      
      if (!facility) {
        return res.status(404).json({ error: 'Facility not found' });
      }

      res.json({
        message: 'Facility updated successfully',
        facility
      });
    } catch (error) {
      console.error('Update facility error:', error);
      res.status(500).json({ error: 'Failed to update facility' });
    }
  },

  // Delete facility
  deleteFacility: async (req, res) => {
    try {
      const { id } = req.params;
      const facility = await Warehouse.deleteFacility(id);
      
      if (!facility) {
        return res.status(404).json({ error: 'Facility not found' });
      }

      res.json({ message: 'Facility deleted successfully' });
    } catch (error) {
      console.error('Delete facility error:', error);
      res.status(500).json({ error: 'Failed to delete facility' });
    }
  },

  // Store produce
  storeProduce: async (req, res) => {
    try {
      const { 
        warehouse_id, 
        farmer_id, 
        crop_type, 
        quantity_kg, 
        quality_grade,
        expected_duration_weeks
      } = req.body;

      const facility = await Warehouse.findFacilityById(warehouse_id);
      if (!facility) {
        return res.status(404).json({ error: 'Facility not found' });
      }

      // Check capacity
      const currentUsage = parseFloat(facility.current_usage_kg || 0);
      const capacity = parseFloat(facility.capacity_kg);
      if (currentUsage + parseFloat(quantity_kg) > capacity) {
        return res.status(400).json({ error: 'Insufficient storage capacity' });
      }

      // Estimate fee
      const feeEstimate = StorageFeeCalculator.estimateFee(
        quantity_kg,
        expected_duration_weeks,
        facility.user_fee_per_kg_per_week
      );

      const produce = await Warehouse.storeProduce({
        warehouse_id,
        farmer_id,
        crop_type,
        quantity_kg,
        quality_grade,
        expected_duration_weeks
      });

      res.status(201).json({
        message: 'Produce stored successfully',
        produce,
        fee_estimate: feeEstimate
      });
    } catch (error) {
      console.error('Store produce error:', error);
      res.status(500).json({ error: 'Failed to store produce' });
    }
  },

  // Retrieve produce
  retrieveProduce: async (req, res) => {
    try {
      const { id } = req.params;

      const produce = await Warehouse.findStoredProduceById(id);
      if (!produce) {
        return res.status(404).json({ error: 'Produce not found' });
      }

      // Calculate actual fee
      const feeCalculation = StorageFeeCalculator.calculateActualFee(produce);

      const updatedProduce = await Warehouse.retrieveProduce(id, feeCalculation.totalFee);

      res.json({
        message: 'Produce retrieved successfully',
        produce: updatedProduce,
        fee_calculation: feeCalculation
      });
    } catch (error) {
      console.error('Retrieve produce error:', error);
      res.status(500).json({ error: 'Failed to retrieve produce' });
    }
  },

  // Get produce by ID
  getProduceById: async (req, res) => {
    try {
      const { id } = req.params;
      const produce = await Warehouse.findStoredProduceById(id);
      
      if (!produce) {
        return res.status(404).json({ error: 'Produce not found' });
      }

      // Calculate current fee if still stored
      let feeCalculation = null;
      if (!produce.retrieved_at) {
        feeCalculation = StorageFeeCalculator.calculateActualFee(produce);
      }

      res.json({
        ...produce,
        fee_calculation: feeCalculation
      });
    } catch (error) {
      console.error('Get produce error:', error);
      res.status(500).json({ error: 'Failed to fetch produce' });
    }
  },

  // Get produce by farmer
  getProduceByFarmer: async (req, res) => {
    try {
      const { farmerId } = req.params;
      const produce = await Warehouse.findProduceByFarmer(farmerId);
      res.json(produce);
    } catch (error) {
      console.error('Get produce error:', error);
      res.status(500).json({ error: 'Failed to fetch produce' });
    }
  },

  // Calculate storage fee
  calculateFee: async (req, res) => {
    try {
      const { quantity_kg, duration_weeks, rate_per_kg_per_week } = req.body;

      const calculation = StorageFeeCalculator.calculate(
        quantity_kg,
        duration_weeks,
        rate_per_kg_per_week
      );

      res.json(calculation);
    } catch (error) {
      console.error('Calculate fee error:', error);
      res.status(500).json({ error: 'Failed to calculate fee' });
    }
  },

  // Log temperature
  logTemperature: async (req, res) => {
    try {
      const { warehouse_id, temperature_celsius, humidity_percent } = req.body;

      const log = await Warehouse.logTemperature({
        warehouse_id,
        temperature_celsius,
        humidity_percent
      });

      res.status(201).json({
        message: 'Temperature logged successfully',
        log
      });
    } catch (error) {
      console.error('Log temperature error:', error);
      res.status(500).json({ error: 'Failed to log temperature' });
    }
  },

  // Get temperature logs
  getTemperatureLogs: async (req, res) => {
    try {
      const { warehouseId } = req.params;
      const { limit = 100 } = req.query;

      const logs = await Warehouse.getTemperatureLogs(warehouseId, parseInt(limit));
      res.json(logs);
    } catch (error) {
      console.error('Get temperature logs error:', error);
      res.status(500).json({ error: 'Failed to fetch temperature logs' });
    }
  },

  // Create maintenance log
  createMaintenanceLog: async (req, res) => {
    try {
      const { warehouse_id, maintenance_type, description, cost, performed_by } = req.body;

      const log = await Warehouse.createMaintenanceLog({
        warehouse_id,
        maintenance_type,
        description,
        cost,
        performed_by
      });

      res.status(201).json({
        message: 'Maintenance log created successfully',
        log
      });
    } catch (error) {
      console.error('Create maintenance log error:', error);
      res.status(500).json({ error: 'Failed to create maintenance log' });
    }
  },

  // Get maintenance logs
  getMaintenanceLogs: async (req, res) => {
    try {
      const { warehouseId } = req.params;
      const logs = await Warehouse.getMaintenanceLogs(warehouseId);
      res.json(logs);
    } catch (error) {
      console.error('Get maintenance logs error:', error);
      res.status(500).json({ error: 'Failed to fetch maintenance logs' });
    }
  },

  // Get inventory summary
  getInventorySummary: async (req, res) => {
    try {
      const facilities = await Warehouse.findAllFacilities();
      
      const summary = {
        total_facilities: facilities.length,
        total_capacity: facilities.reduce((sum, f) => sum + parseFloat(f.capacity_kg || 0), 0),
        total_used: facilities.reduce((sum, f) => sum + parseFloat(f.current_stored_kg || 0), 0),
        facilities: facilities.map(f => ({
          id: f.id,
          name: f.name,
          capacity_kg: f.capacity_kg,
          used_kg: f.current_stored_kg,
          utilization_percentage: f.capacity_kg > 0 
            ? ((f.current_stored_kg / f.capacity_kg) * 100).toFixed(2)
            : 0
        }))
      };

      res.json(summary);
    } catch (error) {
      console.error('Get inventory summary error:', error);
      res.status(500).json({ error: 'Failed to fetch inventory summary' });
    }
  }
};

module.exports = warehouseController;