/**
 * Profit Share Calculator Service
 * Implements 70/30 profit sharing logic between farmer and Sanza Alkebulan
 * Automatically deducts outstanding input costs before splitting
 */

class ProfitShareCalculator {
  /**
   * Calculate profit distribution for a sale
   * @param {number} grossRevenue - Total sale amount
   * @param {number} inputCostsDeducted - Outstanding input costs
   * @returns {Object} Breakdown of profit distribution
   */
  static calculateShare(grossRevenue, inputCostsDeducted = 0) {
    const netRevenue = grossRevenue - inputCostsDeducted;

    // 70/30 split after input costs (70% to Farmer, 30% to SANZA)
    const farmerShare = netRevenue * 0.70;
    const sanzaShare = netRevenue * 0.30;

    return {
      grossRevenue,
      inputCostsDeducted,
      netRevenue,
      farmerShare,
      sanzaShare,
      splitPercentage: 70
    };
  }

  /**
   * Generate a detailed settlement statement
   * @param {Object} saleData - Sale transaction data
   * @param {Array} inputInvoices - List of outstanding input invoices
   * @returns {Object} Detailed settlement report
   */
  static generateSettlementStatement(saleData, inputInvoices = []) {
    const { quantity_kg, price_per_kg, crop_type } = saleData;
    const grossRevenue = quantity_kg * price_per_kg;

    // Calculate total outstanding inputs
    const inputCosts = inputInvoices.reduce((sum, invoice) => sum + invoice.total_amount, 0);

    const distribution = this.calculateShare(grossRevenue, inputCosts);

    return {
      ...distribution,
      saleDetails: {
        crop: crop_type,
        quantity: quantity_kg,
        pricePerKg: price_per_kg
      },
      inputInvoices: inputInvoices.map(inv => ({
        type: inv.invoice_type,
        description: inv.item_description,
        amount: inv.total_amount
      })),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validate if farmer has sufficient earnings after input deduction
   * @param {number} grossRevenue - Sale amount
   * @param {number} inputCosts - Outstanding costs
   * @param {number} minimumThreshold - Minimum acceptable net (default 1000 RWF)
   * @returns {Object} Validation result
   */
  static validateProfitability(grossRevenue, inputCosts, minimumThreshold = 1000) {
    const netRevenue = grossRevenue - inputCosts;
    const farmerShare = netRevenue / 2;

    return {
      isProfitable: farmerShare >= minimumThreshold,
      farmerShare,
      shortfall: farmerShare < minimumThreshold ? minimumThreshold - farmerShare : 0,
      message: farmerShare >= minimumThreshold
        ? 'Sale is profitable for farmer'
        : `Warning: Farmer share (${farmerShare} RWF) below minimum threshold`
    };
  }
}

module.exports = ProfitShareCalculator;