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
  }
};

module.exports = compostController;