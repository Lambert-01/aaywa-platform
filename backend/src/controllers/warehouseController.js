const pool = require('../config/database');

const warehouseController = {
  // =============================================
  // FACILITY MANAGEMENT
  // =============================================

  // Get all facilities with summary
  getAllFacilities: async (req, res) => {
    try {
      const result = await pool.query(`
                SELECT * FROM storage_facilities
                ORDER BY name
            `);
      res.json(result.rows);
    } catch (error) {
      console.error('Get facilities error:', error);
      res.status(500).json({ error: 'Failed to fetch facilities' });
    }
  },

  // Create new facility
  createFacility: async (req, res) => {
    try {
      const {
        name,
        type,
        locationName,
        locationLat,
        locationLng,
        capacityKg,
        description,
        temperatureMin,
        temperatureMax
      } = req.body;

      // Validate required fields
      if (!name || !type || !capacityKg) {
        return res.status(400).json({ error: 'Name, type, and capacity are required' });
      }

      // Validate coordinates
      if (!locationLat || !locationLng) {
        return res.status(400).json({ error: 'GPS coordinates (lat/lng) are required' });
      }

      // Validate Rwanda coordinates (rough bounds)
      if (locationLat < -2.9 || locationLat > -1.0 || locationLng < 28.8 || locationLng > 30.9) {
        return res.status(400).json({
          error: 'Coordinates must be within Rwanda bounds',
          hint: 'Rwanda coordinates: lat -2.9 to -1.0, lng 28.8 to 30.9'
        });
      }

      const result = await pool.query(`
        INSERT INTO storage_facilities (
          name, type, location_name, location_lat, location_lng, capacity_kg,
          description, temperature_min, temperature_max, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        name,
        type,
        locationName || null,
        locationLat,
        locationLng,
        capacityKg,
        description || null,
        temperatureMin || null,
        temperatureMax || null,
        'operational'
      ]);

      res.status(201).json({
        message: 'Facility created successfully',
        facility: result.rows[0]
      });
    } catch (error) {
      console.error('Create facility error:', error);
      if (error.code === '23505') { // Unique constraint violation
        res.status(400).json({ error: 'Facility name already exists' });
      } else {
        res.status(500).json({ error: 'Failed to create facility' });
      }
    }
  },

  // Update facility
  updateFacility: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        type,
        locationName,
        locationLat,
        locationLng,
        capacityKg,
        description,
        temperatureMin,
        temperatureMax,
        status
      } = req.body;

      // Check if facility exists
      const existingFacility = await pool.query(
        'SELECT id FROM storage_facilities WHERE id = $1',
        [id]
      );

      if (existingFacility.rows.length === 0) {
        return res.status(404).json({ error: 'Facility not found' });
      }

      // Build update query dynamically
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramCount++}`);
        values.push(name);
      }
      if (type !== undefined) {
        updates.push(`type = $${paramCount++}`);
        values.push(type);
      }
      if (locationName !== undefined) {
        updates.push(`location_name = $${paramCount++}`);
        values.push(locationName);
      }
      if (locationLat !== undefined) {
        updates.push(`location_lat = $${paramCount++}`);
        values.push(locationLat);
      }
      if (locationLng !== undefined) {
        updates.push(`location_lng = $${paramCount++}`);
        values.push(locationLng);
      }
      if (capacityKg !== undefined) {
        updates.push(`capacity_kg = $${paramCount++}`);
        values.push(capacityKg);
      }
      if (description !== undefined) {
        updates.push(`description = $${paramCount++}`);
        values.push(description);
      }
      if (temperatureMin !== undefined) {
        updates.push(`temperature_min = $${paramCount++}`);
        values.push(temperatureMin);
      }
      if (temperatureMax !== undefined) {
        updates.push(`temperature_max = $${paramCount++}`);
        values.push(temperatureMax);
      }
      if (status !== undefined) {
        updates.push(`status = $${paramCount++}`);
        values.push(status);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await pool.query(`
        UPDATE storage_facilities 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `, values);

      res.json({
        message: 'Facility updated successfully',
        facility: result.rows[0]
      });
    } catch (error) {
      console.error('Update facility error:', error);
      res.status(500).json({ error: 'Failed to update facility' });
    }
  },

  // Get single facility details
  getFacilityById: async (req, res) => {
    try {
      const { id } = req.params;

      const facilityResult = await pool.query('SELECT * FROM storage_facilities WHERE id = $1', [id]);
      if (facilityResult.rows.length === 0) {
        return res.status(404).json({ error: 'Facility not found' });
      }

      // Get current inventory balance
      const inventoryResult = await pool.query(
        'SELECT * FROM inventory_balance WHERE facility_id = $1',
        [id]
      );

      res.json({
        ...facilityResult.rows[0],
        current_inventory: inventoryResult.rows
      });
    } catch (error) {
      console.error('Get facility error:', error);
      res.status(500).json({ error: 'Failed to fetch facility' });
    }
  },

  // =============================================
  // INVENTORY TRANSACTIONS
  // =============================================

  // Record incoming produce
  recordIncoming: async (req, res) => {
    try {
      const {
        facilityId,
        cropType,
        quantityKg,
        qualityGrade,
        farmerId,
        temperature,
        notes
      } = req.body;

      // Validate required fields
      if (!facilityId || !cropType || !quantityKg) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['facilityId', 'cropType', 'quantityKg']
        });
      }

      // Sanitize optional fields - convert empty strings to null
      const sanitizedQualityGrade = qualityGrade && qualityGrade !== '' ? qualityGrade : null;
      const sanitizedTemperature = temperature && temperature !== '' ? parseFloat(temperature) : null;
      const sanitizedFarmerId = farmerId && farmerId !== '' ? parseInt(farmerId) : null;
      const sanitizedNotes = notes && notes !== '' ? notes : null;

      // Validate facility capacity
      const facilityCheck = await pool.query(
        'SELECT capacity_kg, current_usage_kg FROM storage_facilities WHERE id = $1',
        [facilityId]
      );

      if (facilityCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Facility not found' });
      }

      const facility = facilityCheck.rows[0];
      if (parseFloat(facility.current_usage_kg) + parseFloat(quantityKg) > parseFloat(facility.capacity_kg)) {
        return res.status(400).json({
          error: 'Insufficient capacity',
          available: parseFloat(facility.capacity_kg) - parseFloat(facility.current_usage_kg)
        });
      }

      // Record transaction
      const transactionResult = await pool.query(`
                INSERT INTO inventory_transactions (
                    facility_id, crop_type, quantity_kg, direction, reason,
                    quality_grade, temperature_at_transaction, related_farmer_id, notes, created_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *
            `, [
        facilityId,
        cropType,
        quantityKg,
        'incoming',
        'harvest',
        sanitizedQualityGrade,  // Use sanitized value
        sanitizedTemperature,   // Use sanitized value
        sanitizedFarmerId,      // Use sanitized value
        sanitizedNotes,         // Use sanitized value
        req.user?.id || 1
      ]);

      // Update facility usage
      await pool.query(
        'UPDATE storage_facilities SET current_usage_kg = current_usage_kg + $1 WHERE id = $2',
        [quantityKg, facilityId]
      );

      res.status(201).json({
        message: 'Produce recorded successfully',
        transaction: transactionResult.rows[0]
      });
    } catch (error) {
      console.error('Record incoming error:', error);
      res.status(500).json({ error: 'Failed to record incoming produce' });
    }
  },

  // Record outgoing shipment
  recordOutgoing: async (req, res) => {
    try {
      const {
        facilityId,
        cropType,
        quantityKg,
        reason,
        orderId,
        notes,
        lossCategory,
        lossValue,
        rootCause,
        preventionStrategy
      } = req.body;

      // Validate required fields
      if (!facilityId || !cropType || !quantityKg || !reason) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['facilityId', 'cropType', 'quantityKg', 'reason']
        });
      }

      // Sanitize optional fields - convert empty strings to null
      const sanitizedOrderId = orderId && orderId !== '' ? parseInt(orderId) : null;
      const sanitizedNotes = notes && notes !== '' ? notes : null;

      // Validate sufficient inventory
      const availableResult = await pool.query(`
                SELECT current_stock_kg 
                FROM inventory_balance 
                WHERE facility_id = $1 AND crop_type = $2
            `, [facilityId, cropType]);

      const available = availableResult.rows.length > 0 ? parseFloat(availableResult.rows[0].current_stock_kg) : 0;

      if (quantityKg > available) {
        return res.status(400).json({
          error: 'Insufficient inventory',
          available: available,
          requested: quantityKg
        });
      }

      // Record outgoing transaction
      const transactionResult = await pool.query(`
                INSERT INTO inventory_transactions (
                    facility_id, crop_type, quantity_kg, direction, reason,
                    related_order_id, notes, created_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `, [
        facilityId,
        cropType,
        quantityKg,
        'outgoing',
        reason,
        sanitizedOrderId, // Use sanitized value
        sanitizedNotes,   // Use sanitized value
        req.user?.id || 1
      ]);

      // Update facility usage
      await pool.query(
        'UPDATE storage_facilities SET current_usage_kg = current_usage_kg - $1 WHERE id = $2',
        [quantityKg, facilityId]
      );

      // If it's a loss, record in post_harvest_losses
      if (reason === 'damage' || reason === 'spoilage') {
        await pool.query(`
                    INSERT INTO post_harvest_losses (
                        transaction_id, loss_category, loss_quantity_kg, loss_value,
                        root_cause, prevention_strategy
                    ) VALUES ($1, $2, $3, $4, $5, $6)
                `, [
          transactionResult.rows[0].id,
          lossCategory || (reason === 'damage' ? 'physical_damage' : 'spoilage'),
          quantityKg,
          lossValue || 0,
          rootCause,
          preventionStrategy
        ]);
      }

      res.status(201).json({
        message: 'Shipment recorded successfully',
        transaction: transactionResult.rows[0]
      });
    } catch (error) {
      console.error('Record outgoing error:', error);
      res.status(500).json({ error: 'Failed to record outgoing shipment' });
    }
  },

  // Get all transactions
  getTransactions: async (req, res) => {
    try {
      const { facilityId, cropType, direction, limit = 100 } = req.query;

      let query = 'SELECT * FROM inventory_transactions WHERE 1=1';
      const params = [];
      let paramCount = 1;

      if (facilityId) {
        query += ` AND facility_id = $${paramCount++}`;
        params.push(facilityId);
      }
      if (cropType) {
        query += ` AND crop_type = $${paramCount++}`;
        params.push(cropType);
      }
      if (direction) {
        query += ` AND direction = $${paramCount++}`;
        params.push(direction);
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
      params.push(limit);

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  },

  // =============================================
  // DASHBOARD STATS
  // =============================================

  getStats: async (req, res) => {
    try {
      // Total stored
      const totalStoredResult = await pool.query(
        'SELECT SUM(current_usage_kg) as total FROM storage_facilities'
      );
      const totalStored = parseFloat(totalStoredResult.rows[0].total || 0);

      // Total capacity
      const totalCapacityResult = await pool.query(
        'SELECT SUM(capacity_kg) as total FROM storage_facilities'
      );
      const totalCapacity = parseFloat(totalCapacityResult.rows[0].total || 0);

      // Loss rate (last 30 days)
      const lossRateResult = await pool.query(`
                SELECT 
                    COALESCE(SUM(CASE WHEN reason IN ('damage', 'spoilage') THEN quantity_kg ELSE 0 END), 0) as total_loss,
                    COALESCE(SUM(quantity_kg), 0) as total_transactions
                FROM inventory_transactions
                WHERE created_at >= NOW() - INTERVAL '30 days'
            `);
      const lossRate = lossRateResult.rows[0].total_transactions > 0
        ? (parseFloat(lossRateResult.rows[0].total_loss) / parseFloat(lossRateResult.rows[0].total_transactions) * 100)
        : 0;

      // Average storage duration
      const avgDurationResult = await pool.query(`
                SELECT AVG(EXTRACT(DAY FROM (NOW() - created_at))) as avg_days
                FROM inventory_transactions
                WHERE direction = 'incoming' AND created_at >= NOW() - INTERVAL '30 days'
            `);
      const avgDuration = parseFloat(avgDurationResult.rows[0].avg_days || 0);

      // Revenue from sales (last 30 days)
      const revenueResult = await pool.query(`
                SELECT COALESCE(SUM(quantity_kg * 1500), 0) as revenue
                FROM inventory_transactions
                WHERE reason = 'sale' AND created_at >= NOW() - INTERVAL '30 days'
            `);
      const revenue = parseFloat(revenueResult.rows[0].revenue || 0);

      // Losses value (last 30 days)
      const lossesResult = await pool.query(`
                SELECT COALESCE(SUM(loss_value), 0) as total_loss_value
                FROM post_harvest_losses
                WHERE created_at >= NOW() - INTERVAL '30 days'
            `);
      const losses = parseFloat(lossesResult.rows[0].total_loss_value || 0);

      // Maintenance fund (from maintenance records)
      const maintenanceFundResult = await pool.query(`
                SELECT COALESCE(SUM(cost), 0) as spent
                FROM maintenance_records
                WHERE status = 'completed'
            `);
      const maintenanceFund = 20000 - parseFloat(maintenanceFundResult.rows[0].spent || 0);

      res.json({
        totalStored: totalStored.toFixed(2),
        totalCapacity: totalCapacity.toFixed(2),
        usagePercentage: totalCapacity > 0 ? ((totalStored / totalCapacity) * 100).toFixed(1) : 0,
        lossRate: lossRate.toFixed(1),
        avgStorageDuration: avgDuration.toFixed(1),
        maintenanceFund: maintenanceFund.toFixed(0),
        revenue: revenue.toFixed(0),
        losses: losses.toFixed(0)
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  },

  // =============================================
  // TEMPERATURE MONITORING
  // =============================================

  getTemperatureLogs: async (req, res) => {
    try {
      const { facilityId, days = 7 } = req.query;

      let query = `
                SELECT * FROM temperature_logs 
                WHERE recorded_at >= NOW() - INTERVAL '${parseInt(days)} days'
            `;
      const params = [];

      if (facilityId) {
        query += ' AND facility_id = $1';
        params.push(facilityId);
      }

      query += ' ORDER BY recorded_at ASC';

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Get temperature logs error:', error);
      res.status(500).json({ error: 'Failed to fetch temperature logs' });
    }
  },

  logTemperature: async (req, res) => {
    try {
      const { facilityId, temperature, humidity } = req.body;

      // Check for alerts
      const alertTriggered = temperature > 25 || temperature < 5;

      const result = await pool.query(`
                INSERT INTO temperature_logs (
                    facility_id, temperature_celsius, humidity_percent, alert_triggered
                ) VALUES ($1, $2, $3, $4)
                RETURNING *
            `, [facilityId, temperature, humidity, alertTriggered]);

      // Update facility temperature
      await pool.query(
        'UPDATE storage_facilities SET temperature_celsius = $1, humidity_percent = $2 WHERE id = $3',
        [temperature, humidity, facilityId]
      );

      res.status(201).json({
        message: 'Temperature logged successfully',
        log: result.rows[0]
      });
    } catch (error) {
      console.error('Log temperature error:', error);
      res.status(500).json({ error: 'Failed to log temperature' });
    }
  },

  // =============================================
  // MAINTENANCE MANAGEMENT
  // =============================================

  getMaintenance: async (req, res) => {
    try {
      const { facilityId, status } = req.query;

      let query = 'SELECT * FROM maintenance_records WHERE 1=1';
      const params = [];
      let paramCount = 1;

      if (facilityId) {
        query += ` AND facility_id = $${paramCount++}`;
        params.push(facilityId);
      }
      if (status) {
        query += ` AND status = $${paramCount++}`;
        params.push(status);
      }

      query += ' ORDER BY scheduled_date DESC';

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Get maintenance error:', error);
      res.status(500).json({ error: 'Failed to fetch maintenance records' });
    }
  },

  scheduleMaintenance: async (req, res) => {
    try {
      const {
        facilityId,
        issueDescription,
        maintenanceType,
        cost,
        vendorName,
        scheduledDate
      } = req.body;

      const result = await pool.query(`
                INSERT INTO maintenance_records (
                    facility_id, issue_description, maintenance_type, cost,
                    vendor_name, status, scheduled_date, created_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `, [
        facilityId, issueDescription, maintenanceType, cost,
        vendorName, 'scheduled', scheduledDate, req.user?.id || 1
      ]);

      // Update facility maintenance_due_date
      await pool.query(
        'UPDATE storage_facilities SET maintenance_due_date = $1 WHERE id = $2',
        [scheduledDate, facilityId]
      );

      res.status(201).json({
        message: 'Maintenance scheduled successfully',
        maintenance: result.rows[0]
      });
    } catch (error) {
      console.error('Schedule maintenance error:', error);
      res.status(500).json({ error: 'Failed to schedule maintenance' });
    }
  },

  completeMaintenance: async (req, res) => {
    try {
      const { id } = req.params;
      const { completedDate = new Date() } = req.body;

      const result = await pool.query(`
                UPDATE maintenance_records 
                SET status = 'completed', completed_date = $1
                WHERE id = $2
                RETURNING *
            `, [completedDate, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Maintenance record not found' });
      }

      // Update facility last_maintenance_date
      await pool.query(
        'UPDATE storage_facilities SET last_maintenance_date = $1, status = $2 WHERE id = $3',
        [completedDate, 'operational', result.rows[0].facility_id]
      );

      res.json({
        message: 'Maintenance completed successfully',
        maintenance: result.rows[0]
      });
    } catch (error) {
      console.error('Complete maintenance error:', error);
      res.status(500).json({ error: 'Failed to complete maintenance' });
    }
  }
};

module.exports = warehouseController;