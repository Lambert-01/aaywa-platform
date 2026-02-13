const Sale = require('../models/Sale');
const InputInvoice = require('../models/InputInvoice');
const ProfitShareCalculator = require('../services/profitShareCalculator');

const saleController = {
  // Create new sale with auto profit-sharing
  createSale: async (req, res) => {
    try {
      const {
        farmer_id,
        input_invoice_id,
        crop_type,
        quantity,
        unit_price,
        buyer_id
      } = req.body;

      // Calculate profit shares
      const inputCost = input_invoice_id ?
        await InputInvoice.getOutstandingBalance(farmer_id) : 0;

      const calculation = ProfitShareCalculator.calculate(quantity, unit_price, inputCost);

      // Create sale record
      const sale = await Sale.create({
        farmer_id,
        input_invoice_id,
        crop_type,
        quantity,
        unit_price,
        gross_revenue: calculation.grossRevenue,
        input_cost: calculation.inputCost,
        net_revenue: calculation.netRevenue,
        farmer_share: calculation.farmerShare,
        sanza_share: calculation.sanzaShare,
        buyer_id
      });

      // Update input invoice status if fully repaid
      if (input_invoice_id && calculation.inputCost > 0) {
        await InputInvoice.updateStatus(input_invoice_id, 'repaid');
      }

      res.status(201).json({
        message: 'Sale recorded successfully',
        sale,
        profit_sharing: calculation
      });
    } catch (error) {
      console.error('Create sale error:', error);
      res.status(500).json({ error: 'Failed to record sale' });
    }
  },

  // Get all sales
  getAllSales: async (req, res) => {
    try {
      const sales = await Sale.findAll();
      res.json(sales);
    } catch (error) {
      console.error('Get sales error:', error);
      res.status(500).json({ error: 'Failed to fetch sales' });
    }
  },

  // Get sale by ID
  getSaleById: async (req, res) => {
    try {
      const { id } = req.params;
      const sale = await Sale.findById(id);

      if (!sale) {
        return res.status(404).json({ error: 'Sale not found' });
      }

      res.json(sale);
    } catch (error) {
      console.error('Get sale error:', error);
      res.status(500).json({ error: 'Failed to fetch sale' });
    }
  },

  // Get my sales (for logged-in farmer)
  getMySales: async (req, res) => {
    try {
      const userId = req.user.id;
      const pool = require('../config/database');

      // 1. Get Farmer Profile
      const farmerRes = await pool.query('SELECT id FROM farmers WHERE user_id = $1', [userId]);
      if (farmerRes.rows.length === 0) {
        return res.json([]); // No profile = no sales
      }
      const farmerId = farmerRes.rows[0].id;

      // 2. Get Sales
      const sales = await Sale.findByFarmer(farmerId);
      res.json(sales);
    } catch (error) {
      console.error('Get my sales error:', error);
      res.status(500).json({ error: 'Failed to fetch sales history' });
    }
  },

  // Get sales by farmer
  getSalesByFarmer: async (req, res) => {
    try {
      const { farmerId } = req.params;
      const sales = await Sale.findByFarmer(farmerId);
      res.json(sales);
    } catch (error) {
      console.error('Get sales by farmer error:', error);
      res.status(500).json({ error: 'Failed to fetch sales' });
    }
  },

  // Get farmer sales summary
  getFarmerSummary: async (req, res) => {
    try {
      const { farmerId } = req.params;
      const summary = await Sale.getSalesSummary(farmerId);
      res.json(summary);
    } catch (error) {
      console.error('Get farmer summary error:', error);
      res.status(500).json({ error: 'Failed to fetch summary' });
    }
  },

  // Get KPIs
  getKPIs: async (req, res) => {
    try {
      const kpis = await Sale.getKPIs();
      res.json(kpis);
    } catch (error) {
      console.error('Get KPIs error:', error);
      res.status(500).json({ error: 'Failed to fetch KPIs' });
    }
  },

  // Create batch sales
  createBatchSales: async (req, res) => {
    try {
      const { sales } = req.body;
      if (!Array.isArray(sales)) {
        return res.status(400).json({ error: 'Sales must be an array' });
      }

      const results = [];
      const errors = [];

      for (const saleData of sales) {
        try {
          // Map fields from mobile sync if necessary
          const mappedData = {
            farmer_id: saleData.farmer_id,
            input_invoice_id: saleData.input_invoice_id,
            crop_type: saleData.crop_type,
            quantity: saleData.quantity || saleData.quantity_kg,
            unit_price: saleData.unit_price || saleData.price_per_kg,
            buyer_id: saleData.buyer_id,
            sale_date: saleData.date || saleData.sale_date
          };

          // Reuse the creation logic or model direct?
          // To ensure profit sharing logic remains consistent, we'd ideally call a service method
          // For now, mirroring createSale logic:
          const inputCost = mappedData.input_invoice_id ?
            await InputInvoice.getOutstandingBalance(mappedData.farmer_id) : 0;

          const calculation = ProfitShareCalculator.calculate(
            mappedData.quantity,
            mappedData.unit_price,
            inputCost
          );

          const sale = await Sale.create({
            ...mappedData,
            gross_revenue: calculation.grossRevenue,
            input_cost: calculation.inputCost,
            net_revenue: calculation.netRevenue,
            farmer_share: calculation.farmerShare,
            sanza_share: calculation.sanzaShare
          });

          if (mappedData.input_invoice_id && calculation.inputCost > 0) {
            await InputInvoice.updateStatus(mappedData.input_invoice_id, 'repaid');
          }

          results.push(sale);
        } catch (e) {
          console.error('Batch sale item error:', e.message);
          errors.push({ data: saleData, error: e.message });
        }
      }

      res.status(207).json({
        message: 'Batch sales processing complete',
        processedCount: results.length,
        failedCount: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      console.error('Create batch sales error:', error);
      res.status(500).json({ error: 'Failed to process batch sales' });
    }
  },

  // Generate settlement statement
  generateStatement: async (req, res) => {
    try {
      const { id } = req.params;
      const sale = await Sale.findById(id);

      if (!sale) {
        return res.status(404).json({ error: 'Sale not found' });
      }

      const Farmer = require('../models/Farmer');
      const farmer = await Farmer.findById(sale.farmer_id);

      const statement = ProfitShareCalculator.generateSettlementStatement(
        {
          crop_type: sale.crop_type,
          quantity: sale.quantity,
          unitPrice: sale.unit_price,
          inputCost: sale.input_cost
        },
        {
          id: farmer.id,
          full_name: farmer.full_name,
          phone: farmer.phone
        }
      );

      res.json(statement);
    } catch (error) {
      console.error('Generate statement error:', error);
      res.status(500).json({ error: 'Failed to generate statement' });
    }
  },

  // Delete sale
  deleteSale: async (req, res) => {
    try {
      const { id } = req.params;
      const sale = await Sale.delete(id);

      if (!sale) {
        return res.status(404).json({ error: 'Sale not found' });
      }

      res.json({ message: 'Sale deleted successfully' });
    } catch (error) {
      console.error('Delete sale error:', error);
      res.status(500).json({ error: 'Failed to delete sale' });
    }
  }
};

module.exports = saleController;