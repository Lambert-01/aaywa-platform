const pool = require('../config/database');

class Warehouse {
  // Storage Facilities
  static async createFacility(facilityData) {
    const {
      name,
      type,
      location_coordinates,
      capacity_kg,
      user_fee_per_kg_per_week,
      vsla_id
    } = facilityData;

    const query = `
      INSERT INTO storage_facilities 
        (name, type, location_coordinates, capacity_kg, user_fee_per_kg_per_week, vsla_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [name, type, location_coordinates, capacity_kg, user_fee_per_kg_per_week, vsla_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findFacilityById(id) {
    const query = `
      SELECT sf.*, 
             sf.location_coordinates,
             v.name as vsla_name
      FROM storage_facilities sf
      LEFT JOIN vsla_groups v ON sf.vsla_id = v.id
      WHERE sf.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findAllFacilities() {
    const query = `
      SELECT sf.*, 
             sf.location_coordinates,
             v.name as vsla_name,
             COALESCE(SUM(sp.quantity_kg), 0) as current_stored_kg
      FROM storage_facilities sf
      LEFT JOIN vsla_groups v ON sf.vsla_id = v.id
      LEFT JOIN stored_produce sp ON sf.id = sp.warehouse_id AND sp.retrieved_at IS NULL
      GROUP BY sf.id, v.name
      ORDER BY sf.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async updateFacility(id, updateData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(updateData[key]);
        paramIndex++;
      }
    });

    if (fields.length === 0) return null;

    const query = `UPDATE storage_facilities SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Stored Produce
  static async storeProduce(produceData) {
    const {
      warehouse_id,
      farmer_id,
      crop_type,
      quantity_kg,
      quality_grade,
      expected_duration_weeks
    } = produceData;

    const query = `
      INSERT INTO stored_produce 
        (warehouse_id, farmer_id, crop_type, quantity_kg, quality_grade, expected_duration_weeks)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [warehouse_id, farmer_id, crop_type, quantity_kg, quality_grade, expected_duration_weeks];
    const result = await pool.query(query, values);

    // Update current usage
    await this.updateCurrentUsage(warehouse_id);

    return result.rows[0];
  }

  static async retrieveProduce(id, storageFeePaid) {
    const query = `
      UPDATE stored_produce 
      SET retrieved_at = NOW(), 
          storage_fee_paid = $1,
          payment_status = 'paid'
      WHERE id = $2 
      RETURNING *
    `;
    const result = await pool.query(query, [storageFeePaid, id]);

    // Update current usage
    const warehouseId = result.rows[0].warehouse_id;
    await this.updateCurrentUsage(warehouseId);

    return result.rows[0];
  }

  static async findStoredProduceById(id) {
    const query = `
      SELECT sp.*, 
             u.full_name as farmer_name,
             sf.name as warehouse_name,
             sf.user_fee_per_kg_per_week
      FROM stored_produce sp
      JOIN farmers f ON sp.farmer_id = f.id
      JOIN users u ON f.user_id = u.id
      JOIN storage_facilities sf ON sp.warehouse_id = sf.id
      WHERE sp.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findProduceByWarehouse(warehouseId) {
    const query = `
      SELECT sp.*, 
             u.full_name as farmer_name,
             sf.name as warehouse_name
      FROM stored_produce sp
      JOIN farmers f ON sp.farmer_id = f.id
      JOIN users u ON f.user_id = u.id
      JOIN storage_facilities sf ON sp.warehouse_id = sf.id
      WHERE sp.warehouse_id = $1 AND sp.retrieved_at IS NULL
      ORDER BY sp.stored_at DESC
    `;
    const result = await pool.query(query, [warehouseId]);
    return result.rows;
  }

  static async findProduceByFarmer(farmerId) {
    const query = `
      SELECT sp.*, 
             sf.name as warehouse_name,
             sf.user_fee_per_kg_per_week
      FROM stored_produce sp
      JOIN storage_facilities sf ON sp.warehouse_id = sf.id
      WHERE sp.farmer_id = $1
      ORDER BY sp.stored_at DESC
    `;
    const result = await pool.query(query, [farmerId]);
    return result.rows;
  }

  static async updateCurrentUsage(warehouseId) {
    const query = `
      UPDATE storage_facilities 
      SET current_usage_kg = (
        SELECT COALESCE(SUM(quantity_kg), 0)
        FROM stored_produce
        WHERE warehouse_id = $1 AND retrieved_at IS NULL
      )
      WHERE id = $1
    `;
    await pool.query(query, [warehouseId]);
  }

  // Temperature Logs (Optional IoT)
  static async logTemperature(logData) {
    const { warehouse_id, temperature_celsius, humidity_percent } = logData;
    const query = `
      INSERT INTO temperature_logs (warehouse_id, temperature_celsius, humidity_percent)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [warehouse_id, temperature_celsius, humidity_percent];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getTemperatureLogs(warehouseId, limit = 100) {
    const query = `
      SELECT *
      FROM temperature_logs
      WHERE warehouse_id = $1
      ORDER BY recorded_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [warehouseId, limit]);
    return result.rows;
  }

  // Maintenance Log
  static async createMaintenanceLog(logData) {
    const { warehouse_id, maintenance_type, description, cost, performed_by } = logData;
    const query = `
      INSERT INTO maintenance_logs (warehouse_id, maintenance_type, description, cost, performed_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [warehouse_id, maintenance_type, description, cost, performed_by];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getMaintenanceLogs(warehouseId) {
    const query = `
      SELECT ml.*, u.full_name as performed_by_name
      FROM maintenance_logs ml
      LEFT JOIN users u ON ml.performed_by = u.id
      WHERE ml.warehouse_id = $1
      ORDER BY ml.maintenance_date DESC
    `;
    const result = await pool.query(query, [warehouseId]);
    return result.rows;
  }

  static async deleteFacility(id) {
    const query = 'DELETE FROM storage_facilities WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Warehouse;