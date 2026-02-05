const db = require('../config/database');

/**
 * Dashboard Controller
 * Provides aggregated KPIs and analytics for the main dashboard
 */

// GET /api/dashboard/kpi - Get key performance indicators
const getKPIs = async (req, res) => {
    try {
        // Total active farmers
        const farmerResult = await db.query(
            'SELECT COUNT(*)::int as count FROM farmers WHERE is_active = true'
        );

        // Active cohorts
        const cohortResult = await db.query(
            "SELECT COUNT(*)::int as count FROM cohorts WHERE status = 'active'"
        );

        // Total VSLA savings
        const vslaResult = await db.query(
            'SELECT COALESCE(SUM(total_savings), 0)::float as total FROM vsla_groups'
        );

        // Compost produced (completed batches only)
        const compostResult = await db.query(
            "SELECT COALESCE(SUM(kg_produced), 0)::float as total FROM compost_batches WHERE status = 'completed'"
        );

        // Total revenue (all time)
        const revenueResult = await db.query(
            'SELECT COALESCE(SUM(net_revenue), 0)::float as total FROM sales'
        );

        // Training sessions completed
        const trainingResult = await db.query(
            "SELECT COUNT(*)::int as count FROM training_sessions WHERE status = 'completed'"
        );

        res.json({
            farmers: farmerResult.rows[0].count,
            cohorts: cohortResult.rows[0].count,
            vslaSavings: vslaResult.rows[0].total,
            compostProduced: compostResult.rows[0].total,
            totalRevenue: revenueResult.rows[0].total,
            trainingSessions: trainingResult.rows[0].count,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching KPIs:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard KPIs' });
    }
};

// GET /api/dashboard/activity - Get recent activity feed
const getRecentActivity = async (req, res) => {
    try {
        const activities = await db.query(`
      SELECT 'training' as type, 
             title as description, 
             date as timestamp,
             cohort_id as related_id
      FROM training_sessions
      WHERE status = 'completed'
      
      UNION ALL
      
      SELECT 'compost' as type,
             CONCAT('Batch ', batch_number, ' completed - ', kg_produced::text, ' kg') as description,
             maturity_date as timestamp,
             id as related_id
      FROM compost_batches
      WHERE status = 'completed'
      
      UNION ALL
      
      SELECT 'sale' as type,
             CONCAT(crop_type, ' sale - ', quantity_kg::text, ' kg') as description,
             sale_date as timestamp,
             farmer_id as related_id
      FROM sales
      
      ORDER BY timestamp DESC
      LIMIT 15
    `);

        res.json(activities.rows);
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
};

// GET /api/dashboard/cohort-stats - Get cohort statistics
const getCohortStats = async (req, res) => {
    try {
        const stats = await db.query(`
      SELECT 
        c.id,
        c.name,
        c.cropping_system,
        COUNT(DISTINCT f.id)::int as farmer_count,
        COUNT(DISTINCT t.id)::int as training_count,
        COALESCE(SUM(s.net_revenue), 0)::float as total_revenue
      FROM cohorts c
      LEFT JOIN farmers f ON c.id = f.cohort_id AND f.is_active = true
      LEFT JOIN training_sessions t ON c.id = t.cohort_id
      LEFT JOIN sales s ON s.farmer_id = f.id
      WHERE c.status = 'active'
      GROUP BY c.id, c.name, c.cropping_system
      ORDER BY c.id
    `);

        res.json(stats.rows);
    } catch (error) {
        console.error('Error fetching cohort stats:', error);
        res.status(500).json({ error: 'Failed to fetch cohort statistics' });
    }
};

// GET /api/dashboard/vsla-summary - Get VSLA summary
const getVSLASummary = async (req, res) => {
    try {
        const summary = await db.query(`
      SELECT 
        v.id,
        v.name,
        v.seed_capital,
        v.total_savings,
        v.member_count,
        c.name as cohort_name
      FROM vsla_groups v
      JOIN cohorts c ON v.cohort_id = c.id
      WHERE c.status = 'active'
      ORDER BY v.id
    `);

        res.json(summary.rows);
    } catch (error) {
        console.error('Error fetching VSLA summary:', error);
        res.status(500).json({ error: 'Failed to fetch VSLA summary' });
    }
};

module.exports = {
    getKPIs,
    getRecentActivity,
    getCohortStats,
    getVSLASummary
};
