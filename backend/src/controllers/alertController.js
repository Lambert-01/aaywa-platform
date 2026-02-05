const pool = require('../config/database');

/**
 * Alert Controller - Real-time Intelligence & Notifications
 * Generates actionable insights based on platform data
 */

// Get active alerts for dashboard
const getActiveAlerts = async (req, res) => {
    try {
        const alerts = await pool.query(
            `SELECT 
        id, alert_type, severity, title, message, 
        action_url, entity_type, entity_id, entity_name,
        threshold_value, actual_value, created_at
      FROM alerts 
      WHERE NOT dismissed 
      ORDER BY severity DESC, created_at DESC 
      LIMIT 20`
        );

        res.json({ alerts: alerts.rows });
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
};

// Generate alerts based on current data
const generateAlerts = async (req, res) => {
    try {
        const alerts = [];

        // 1. Check Cohort Repayment Rates (< 85% threshold)
        const lowRepaymentCohorts = await pool.query(`
      SELECT 
        c.id,
        c.name,
        COALESCE(
          (SELECT COUNT(*) * 100.0 / NULLIF(COUNT(DISTINCT i.id), 0)
           FROM input_invoices i 
           WHERE i.farmer_id IN (SELECT id FROM farmers WHERE cohort_id = c.id)
           AND i.payment_status = 'paid'
          ), 0
        ) as repayment_rate
      FROM cohorts c
      WHERE c.status = 'active'
    `);

        for (const cohort of lowRepaymentCohorts.rows) {
            if (cohort.repayment_rate < 85) {
                // Check if alert already exists
                const existing = await pool.query(
                    'SELECT id FROM alerts WHERE entity_type = $1 AND entity_id = $2 AND NOT dismissed AND alert_type = $3',
                    ['cohort', cohort.id, 'repayment_risk']
                );

                if (existing.rows.length === 0) {
                    await pool.query(`
            INSERT INTO alerts (
              alert_type, severity, title, message, action_url,
              entity_type, entity_id, entity_name, threshold_value, actual_value
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `, [
                        'repayment_risk',
                        'warning',
                        `Low Repayment Rate - ${cohort.name}`,
                        `Cohort ${cohort.name} repayment rate is ${cohort.repayment_rate.toFixed(1)}% — below 85% threshold. Immediate action required.`,
                        `/dashboard/cohorts/${cohort.id}`,
                        'cohort',
                        cohort.id,
                        cohort.name,
                        85,
                        cohort.repayment_rate
                    ]);

                    alerts.push({ type: 'repayment_risk', cohort: cohort.name });
                }
            }
        }

        // 2. Check Warehouse Temperatures (> 15°C for cold storage)
        const highTempWarehouses = await pool.query(`
      SELECT id, name, 
        CAST(coordinates->>'temperature' AS DECIMAL) as temperature_celsius
      FROM warehouses 
      WHERE is_active = true
      AND coordinates->>'type' = 'cold_room'
      AND CAST(coordinates->>'temperature' AS DECIMAL) > 15
    `);

        for (const warehouse of highTempWarehouses.rows) {
            const existing = await pool.query(
                'SELECT id FROM alerts WHERE entity_type = $1 AND entity_id = $2 AND NOT dismissed AND alert_type = $3',
                ['warehouse', warehouse.id, 'temperature_warning']
            );

            if (existing.rows.length === 0) {
                await pool.query(`
          INSERT INTO alerts (
            alert_type, severity, title, message, action_url,
            entity_type, entity_id, entity_name, threshold_value, actual_value
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
                    'temperature_warning',
                    'critical',
                    `Temperature Alert - ${warehouse.name}`,
                    `${warehouse.name} temperature at ${warehouse.temperature_celsius}°C — avocado spoilage risk! Check cooling system immediately.`,
                    `/dashboard/warehouse`,
                    'warehouse',
                    warehouse.id,
                    warehouse.name,
                    15,
                    warehouse.temperature_celsius
                ]);

                alerts.push({ type: 'temperature', warehouse: warehouse.name });
            }
        }

        // 3. Check Farmer Engagement (no training in 3 weeks)
        const disengagedFarmers = await pool.query(`
      SELECT 
        f.id,
        f.full_name,
        MAX(ta.created_at) as last_training
      FROM farmers f
      LEFT JOIN training_attendance ta ON ta.farmer_id = f.id
      WHERE f.is_active = true
      GROUP BY f.id, f.full_name
      HAVING MAX(ta.created_at) < NOW() - INTERVAL '21 days' OR MAX(ta.created_at) IS NULL
      LIMIT 10
    `);

        for (const farmer of disengagedFarmers.rows) {
            const existing = await pool.query(
                'SELECT id FROM alerts WHERE entity_type = $1 AND entity_id = $2 AND NOT dismissed AND alert_type = $3',
                ['farmer', farmer.id, 'engagement_low']
            );

            if (existing.rows.length === 0) {
                await pool.query(`
          INSERT INTO alerts (
            alert_type, severity, title, message, action_url,
            entity_type, entity_id, entity_name
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
                    'engagement_low',
                    'info',
                    `Low Engagement - ${farmer.full_name}`,
                    `${farmer.full_name} hasn't attended training in over 3 weeks. Consider outreach or SMS reminder.`,
                    `/dashboard/farmers/${farmer.id}`,
                    'farmer',
                    farmer.id,
                    farmer.full_name
                ]);

                alerts.push({ type: 'engagement', farmer: farmer.full_name });
            }
        }

        // 4. Check Warehouse Stock Levels (> 90% capacity)
        const nearFullWarehouses = await pool.query(`
      SELECT 
        id, name, capacity_kg, current_stock_kg,
        ROUND((current_stock_kg * 100.0 / NULLIF(capacity_kg, 0)), 1) as usage_percent
      FROM warehouses 
      WHERE is_active = true
      AND (current_stock_kg * 100.0 / NULLIF(capacity_kg, 0)) > 90
    `);

        for (const warehouse of nearFullWarehouses.rows) {
            const existing = await pool.query(
                'SELECT id FROM alerts WHERE entity_type = $1 AND entity_id = $2 AND NOT dismissed AND alert_type = $3',
                ['warehouse', warehouse.id, 'stock_high']
            );

            if (existing.rows.length === 0) {
                await pool.query(`
          INSERT INTO alerts (
            alert_type, severity, title, message, action_url,
            entity_type, entity_id, entity_name, threshold_value, actual_value
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
                    'stock_high',
                    'warning',
                    `High Capacity - ${warehouse.name}`,
                    `${warehouse.name} at ${warehouse.usage_percent}% capacity. Consider dispatching produce or expanding storage.`,
                    `/dashboard/warehouse`,
                    'warehouse',
                    warehouse.id,
                    warehouse.name,
                    90,
                    warehouse.usage_percent
                ]);

                alerts.push({ type: 'stock_high', warehouse: warehouse.name });
            }
        }

        res.json({
            success: true,
            generated: alerts.length,
            alerts
        });
    } catch (error) {
        console.error('Error generating alerts:', error);
        res.status(500).json({ error: 'Failed to generate alerts' });
    }
};

// Dismiss an alert
const dismissAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await pool.query(
            'UPDATE alerts SET dismissed = true, dismissed_at = NOW(), dismissed_by = $1 WHERE id = $2',
            [userId, id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error dismissing alert:', error);
        res.status(500).json({ error: 'Failed to dismiss alert' });
    }
};

// Get alert history
const getAlertHistory = async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const alerts = await pool.query(
            `SELECT 
        a.*, 
        u.full_name as dismissed_by_name
      FROM alerts a
      LEFT JOIN users u ON a.dismissed_by = u.id
      ORDER BY a.created_at DESC
      LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const total = await pool.query('SELECT COUNT(*) FROM alerts');

        res.json({
            alerts: alerts.rows,
            total: parseInt(total.rows[0].count),
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        console.error('Error fetching alert history:', error);
        res.status(500).json({ error: 'Failed to fetch alert history' });
    }
};

module.exports = {
    getActiveAlerts,
    generateAlerts,
    dismissAlert,
    getAlertHistory
};
