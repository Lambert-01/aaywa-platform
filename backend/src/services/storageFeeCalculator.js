/**
 * Storage Fee Calculator Service
 * Calculates warehouse storage fees based on weight, duration, and facility rates
 */

class StorageFeeCalculator {
  /**
   * Calculate storage fee for stored produce
   * @param {Object} produceData - Stored produce information
   * @param {Object} facilityData - Storage facility information
   * @returns {Object} Fee calculation breakdown
   */
  static calculateFee(produceData, facilityData) {
    const { quantity_kg, stored_at, retrieved_at } = produceData;
    const { user_fee_per_kg_per_week } = facilityData;

    if (!retrieved_at) {
      return {
        status: 'in_storage',
        fee: 0,
        message: 'Produce still in storage. Fee will be calculated upon retrieval.'
      };
    }

    // Calculate storage duration in weeks
    const storedDate = new Date(stored_at);
    const retrievedDate = new Date(retrieved_at);
    const durationMs = retrievedDate - storedDate;
    const durationWeeks = durationMs / (7 * 24 * 60 * 60 * 1000); // Convert ms to weeks

    // Calculate fee
    const totalFee = quantity_kg * user_fee_per_kg_per_week * Math.ceil(durationWeeks);

    return {
      status: 'retrieved',
      quantity_kg,
      durationDays: Math.ceil(durationMs / (24 * 60 * 60 * 1000)),
      durationWeeks: Math.ceil(durationWeeks),
      ratePerKgPerWeek: user_fee_per_kg_per_week,
      totalFee: parseFloat(totalFee.toFixed(2)),
      storedAt: stored_at,
      retrievedAt: retrieved_at
    };
  }

  /**
   * Calculate ongoing storage cost estimate
   * @param {number} quantity_kg - Quantity in storage
   * @param {Date} stored_at - Storage start date
   * @param {number} feeRate - Fee per kg per week
   * @returns {Object} Current estimated costs
   */
  static calculateOngoingCost(quantity_kg, stored_at, feeRate) {
    const storedDate = new Date(stored_at);
    const now = new Date();
    const durationMs = now - storedDate;
    const durationWeeks = durationMs / (7 * 24 * 60 * 60 * 1000);

    const estimatedFee = quantity_kg * feeRate * durationWeeks;

    return {
      quantity_kg,
      durationDays: Math.floor(durationMs / (24 * 60 * 60 * 1000)),
      durationWeeks: parseFloat(durationWeeks.toFixed(2)),
      ratePerKgPerWeek: feeRate,
      estimatedFee: parseFloat(estimatedFee.toFixed(2)),
      message: 'Estimated cost. Final fee calculated upon retrieval.'
    };
  }

  /**
   * Calculate bulk storage fees for multiple batches
   * @param {Array} produceList - Array of stored produce items
   * @param {Object} facilityData - Storage facility information
   * @returns {Object} Aggregated fee summary
   */
  static calculateBulkFees(produceList, facilityData) {
    const fees = produceList.map(produce =>
      this.calculateFee(produce, facilityData)
    );

    const totalFee = fees.reduce((sum, f) => sum + (f.totalFee || 0), 0);
    const totalKg = produceList.reduce((sum, p) => sum + p.quantity_kg, 0);

    return {
      itemCount: produceList.length,
      totalKg,
      totalFee: parseFloat(totalFee.toFixed(2)),
      averageFeePerKg: parseFloat((totalFee / totalKg).toFixed(2)),
      details: fees
    };
  }

  /**
   * Generate invoice for storage fees
   * @param {Object} feeCalculation - Result from calculateFee()
   * @param {Object} farmerInfo - Farmer details
   * @param {Object} warehouseInfo - Warehouse details
   * @returns {Object} Invoice document
   */
  static generateInvoice(feeCalculation, farmerInfo, warehouseInfo) {
    return {
      invoiceNumber: `INV-STORE-${Date.now()}`,
      invoiceDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      farmer: {
        id: farmerInfo.id,
        name: farmerInfo.full_name,
        phone: farmerInfo.phone
      },
      warehouse: {
        id: warehouseInfo.id,
        name: warehouseInfo.name
      },
      lineItems: [
        {
          description: `Storage fee for ${feeCalculation.quantity_kg} kg`,
          duration: `${feeCalculation.durationWeeks} weeks`,
          rate: `${feeCalculation.ratePerKgPerWeek} RWF/kg/week`,
          amount: feeCalculation.totalFee
        }
      ],
      totalAmount: feeCalculation.totalFee,
      currency: 'RWF',
      paymentStatus: 'pending'
    };
  }
}

module.exports = StorageFeeCalculator;