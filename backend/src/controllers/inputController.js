const InputInvoice = require('../models/InputInvoice');

const inputController = {
  // Create new input invoice
  createInvoice: async (req, res) => {
    try {
      const { farmer_id, items, issued_by } = req.body;

      // Calculate total amount
      const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

      const invoice = await InputInvoice.create({
        farmer_id,
        items,
        total_amount,
        issued_by
      });

      res.status(201).json({
        message: 'Input invoice created successfully',
        invoice
      });
    } catch (error) {
      console.error('Create invoice error:', error);
      res.status(500).json({ error: 'Failed to create invoice' });
    }
  },

  // Create batch invoices (for offline sync)
  createBatchInvoices: async (req, res) => {
    try {
      const { invoices } = req.body;
      if (!invoices || !Array.isArray(invoices)) {
        return res.status(400).json({ error: 'Invoices array is required' });
      }

      const createdInvoices = await InputInvoice.createBatch(invoices);

      res.status(201).json({
        message: 'Batch invoices created successfully',
        invoices: createdInvoices
      });
    } catch (error) {
      console.error('Create batch invoices error:', error);
      res.status(500).json({ error: 'Failed to create batch invoices' });
    }
  },

  // Get all invoices
  getAllInvoices: async (req, res) => {
    try {
      const invoices = await InputInvoice.findAll();
      res.json(invoices);
    } catch (error) {
      console.error('Get invoices error:', error);
      res.status(500).json({ error: 'Failed to fetch invoices' });
    }
  },

  // Get invoice by ID
  getInvoiceById: async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await InputInvoice.findById(id);

      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      res.json(invoice);
    } catch (error) {
      console.error('Get invoice error:', error);
      res.status(500).json({ error: 'Failed to fetch invoice' });
    }
  },

  // Get invoices by farmer
  getInvoicesByFarmer: async (req, res) => {
    try {
      const { farmerId } = req.params;
      const invoices = await InputInvoice.findByFarmer(farmerId);
      res.json(invoices);
    } catch (error) {
      console.error('Get invoices by farmer error:', error);
      res.status(500).json({ error: 'Failed to fetch invoices' });
    }
  },

  // Update invoice status
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const invoice = await InputInvoice.updateStatus(id, status);

      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      res.json({
        message: 'Invoice status updated successfully',
        invoice
      });
    } catch (error) {
      console.error('Update invoice status error:', error);
      res.status(500).json({ error: 'Failed to update invoice status' });
    }
  },

  // Get farmer's outstanding balance
  getOutstandingBalance: async (req, res) => {
    try {
      const { farmerId } = req.params;
      const balance = await InputInvoice.getOutstandingBalance(farmerId);
      res.json({ farmer_id: farmerId, outstanding_balance: balance });
    } catch (error) {
      console.error('Get outstanding balance error:', error);
      res.status(500).json({ error: 'Failed to fetch outstanding balance' });
    }
  },

  // Delete invoice
  deleteInvoice: async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await InputInvoice.delete(id);

      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
      console.error('Delete invoice error:', error);
      res.status(500).json({ error: 'Failed to delete invoice' });
    }
  }
};

module.exports = inputController;