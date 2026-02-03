const Compost = require('../models/Compost');

const compostController = {
  // Create new compost batch
  createBatch: async (req, res) => {
    try {
      const { batch_number, production_date, quantity_kg, quality_score, produced_by } = req.body;

      const batch = await Compost.createBatch({
        batch_number,
        production_date,
        quantity_kg,
        quality_score,
        produced_by
      });

      res.status(201).json({
        message: 'Compost batch created successfully',
        batch
      });
    } catch (error) {
      console.error('Create batch error:', error);
      res.status(500).json({ error: 'Failed to create batch' });
    }
  },

  // Get all batches
  getAllBatches: async (req, res) => {
    try {
      const batches = await Compost.findAllBatches();
      res.json(batches);
    } catch (error) {
      console.error('Get batches error:', error);
      res.status(500).json({ error: 'Failed to fetch batches' });
    }
  },

  // Get batch by ID
  getBatchById: async (req, res) => {
    try {
      const { id } = req.params;
      const batch = await Compost.findBatchById(id);

      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }

      // Get workdays for this batch
      const workdays = await Compost.findWorkdaysByBatch(id);

      res.json({
        ...batch,
        workdays
      });
    } catch (error) {
      console.error('Get batch error:', error);
      res.status(500).json({ error: 'Failed to fetch batch' });
    }
  },

  // Update batch
  updateBatch: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const batch = await Compost.updateBatch(id, updateData);

      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }

      res.json({
        message: 'Batch updated successfully',
        batch
      });
    } catch (error) {
      console.error('Update batch error:', error);
      res.status(500).json({ error: 'Failed to update batch' });
    }
  },

  // Record workday
  createWorkday: async (req, res) => {
    try {
      const { worker_id, batch_id, date_worked, hours_worked, daily_wage } = req.body;

      const workday = await Compost.createWorkday({
        worker_id,
        batch_id,
        date_worked,
        hours_worked,
        daily_wage: daily_wage || 2500 // Default €2.50 = ~2500 RWF
      });

      res.status(201).json({
        message: 'Workday recorded successfully',
        workday
      });
    } catch (error) {
      console.error('Create workday error:', error);
      res.status(500).json({ error: 'Failed to record workday' });
    }
  },

  // Get workdays by batch
  getWorkdaysByBatch: async (req, res) => {
    try {
      const { batchId } = req.params;
      const workdays = await Compost.findWorkdaysByBatch(batchId);
      res.json(workdays);
    } catch (error) {
      console.error('Get workdays error:', error);
      res.status(500).json({ error: 'Failed to fetch workdays' });
    }
  },

  // Get workdays by worker
  getWorkdaysByWorker: async (req, res) => {
    try {
      const { workerId } = req.params;
      const workdays = await Compost.findWorkdaysByWorker(workerId);
      res.json(workdays);
    } catch (error) {
      console.error('Get workdays error:', error);
      res.status(500).json({ error: 'Failed to fetch workdays' });
    }
  },

  // Update payment status
  updatePaymentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { payment_status, payment_reference } = req.body;

      const workday = await Compost.updateWorkdayPayment(id, payment_status, payment_reference);

      if (!workday) {
        return res.status(404).json({ error: 'Workday not found' });
      }

      res.json({
        message: 'Payment status updated successfully',
        workday
      });
    } catch (error) {
      console.error('Update payment error:', error);
      res.status(500).json({ error: 'Failed to update payment status' });
    }
  },

  // Get pending payments
  getPendingPayments: async (req, res) => {
    try {
      const payments = await Compost.getPendingPayments();
      res.json(payments);
    } catch (error) {
      console.error('Get pending payments error:', error);
      res.status(500).json({ error: 'Failed to fetch pending payments' });
    }
  },

  // Get stipend summary
  getStipendSummary: async (req, res) => {
    try {
      const summary = await Compost.getStipendSummary();
      res.json(summary);
    } catch (error) {
      console.error('Get stipend summary error:', error);
      res.status(500).json({ error: 'Failed to fetch summary' });
    }
  },

  // Feedstock Management
  addFeedstockItem: async (req, res) => {
    try {
      const { id } = req.params;
      const feedstockData = req.body;

      const item = await Compost.addFeedstockItem(id, feedstockData);

      res.status(201).json({
        message: 'Feedstock item added successfully',
        item
      });
    } catch (error) {
      console.error('Add feedstock error:', error);
      res.status(500).json({ error: 'Failed to add feedstock item' });
    }
  },

  getFeedstockItems: async (req, res) => {
    try {
      const { id } = req.params;
      const items = await Compost.getFeedstockItems(id);
      res.json(items);
    } catch (error) {
      console.error('Get feedstock error:', error);
      res.status(500).json({ error: 'Failed to fetch feedstock items' });
    }
  },

  // Quality Metrics
  updateQualityMetrics: async (req, res) => {
    try {
      const { id } = req.params;
      const metricsData = req.body;

      const batch = await Compost.updateQualityMetrics(id, metricsData);

      if (!batch) {
        return res.status(404).json({ error: 'Batch not found or no metrics to update' });
      }

      res.json({
        message: 'Quality metrics updated successfully',
        batch
      });
    } catch (error) {
      console.error('Update quality metrics error:', error);
      res.status(500).json({ error: 'Failed to update quality metrics' });
    }
  },

  // Sales Management
  createSale: async (req, res) => {
    try {
      const saleData = {
        ...req.body,
        created_by: req.user.id
      };

      const sale = await Compost.createSale(saleData);

      res.status(201).json({
        message: 'Sale recorded successfully',
        sale
      });
    } catch (error) {
      console.error('Create sale error:', error);
      res.status(500).json({ error: 'Failed to record sale' });
    }
  },

  getSalesByBatch: async (req, res) => {
    try {
      const { id } = req.params;
      const sales = await Compost.getSalesByBatch(id);
      res.json(sales);
    } catch (error) {
      console.error('Get sales error:', error);
      res.status(500).json({ error: 'Failed to fetch sales' });
    }
  },

  getAllSales: async (req, res) => {
    try {
      const sales = await Compost.getAllSales();
      res.json(sales);
    } catch (error) {
      console.error('Get all sales error:', error);
      res.status(500).json({ error: 'Failed to fetch sales' });
    }
  },

  // Dashboard Summary
  getSummary: async (req, res) => {
    try {
      const summary = await Compost.getSummaryStats();
      res.json(summary);
    } catch (error) {
      console.error('Get summary error:', error);
      res.status(500).json({ error: 'Failed to fetch summary statistics' });
    }
  },

  // Get all batches with full details (using view)
  getAllBatchesWithDetails: async (req, res) => {
    try {
      const batches = await Compost.findAllBatchesWithDetails();
      res.json(batches);
    } catch (error) {
      console.error('Get batches with details error:', error);
      res.status(500).json({ error: 'Failed to fetch batches' });
    }
  }
};

module.exports = compostController;