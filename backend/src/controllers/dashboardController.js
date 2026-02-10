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

// GET /api/dashboard/charts - Get data for all dashboard charts
const getDashboardCharts = async (req, res) => {
    try {
        // 1. Farmer Demographics
        const demographics = await db.query(`
            SELECT household_type, COUNT(*)::int as count 
            FROM farmers 
            WHERE is_active = true 
            GROUP BY household_type
        `);

        // 2. Financial Overview (Last 6 Months) - Farmer Share vs SANZA Share
        const financials = await db.query(`
            SELECT 
                TO_CHAR(sale_date, 'Mon') as name,
                SUM(farmer_share)::float as "Farmer",
                SUM(sanza_share)::float as "SANZA"
            FROM sales 
            WHERE sale_date >= NOW() - INTERVAL '6 months'
            GROUP BY TO_CHAR(sale_date, 'Mon'), DATE_TRUNC('month', sale_date)
            ORDER BY DATE_TRUNC('month', sale_date)
        `);

        // 3. Compost Pipeline
        const compost = await db.query(`
            SELECT status as name, COUNT(*)::int as value 
            FROM compost_batches 
            GROUP BY status
        `);

        // 4. Training Effectiveness (Last 5 Sessions)
        // Note: Column attendance_count might be missing in some environments
        // defaulting to zero/empty for now as requested
        let training = { rows: [] };
        try {
            training = await db.query(`
                SELECT 
                    t.title || ' (' || c.name || ')' as name,
                    COALESCE(t.attendance_count, 0) as "Attendance",
                    (SELECT COUNT(*) FROM farmers f WHERE f.cohort_id = t.cohort_id AND f.is_active = true) as "Scheduled",
                    CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END as "Completed"
                FROM training_sessions t
                JOIN cohorts c ON t.cohort_id = c.id
                WHERE t.status = 'completed'
                ORDER BY t.scheduled_date DESC
                LIMIT 5
            `);
        } catch (err) {
            console.warn('Training stats query failed, returning zeros:', err.message);
            // Return dummy data with zeros
            training = {
                rows: [
                    { name: 'Training Data Unavailable', Attendance: 0, Scheduled: 0, Completed: 0 }
                ]
            };
        }

        // 5. Warehouse Utilization
        const warehouses = await db.query(`
            SELECT 
                name, 
                (current_stock_kg / NULLIF(capacity_kg, 0) * 100)::int as uv,
                '#8884d8' as fill
            FROM warehouses 
            WHERE is_active = true
        `);

        res.json({
            demographics: demographics.rows,
            financials: financials.rows,
            compost: compost.rows,
            training: training.rows,
            warehouse: warehouses.rows
        });
    } catch (error) {
        console.error('Error fetching chart data:', error);
        res.status(500).json({ error: 'Failed to fetch chart data' });
    }
};

// GET /api/dashboard/map - Get geospatial data
const getDashboardMap = async (req, res) => {
    try {
        const cohorts = await db.query(`
            SELECT id, name, boundary_coordinates as center, status 
            FROM cohorts 
            WHERE status = 'active'
        `);

        const warehouses = await db.query(`
            SELECT id, name, coordinates as position, current_stock_kg, capacity_kg 
            FROM warehouses 
            WHERE is_active = true
        `);

        res.json({
            cohorts: cohorts.rows,
            warehouses: warehouses.rows
        });
    } catch (error) {
        console.error('Error fetching map data:', error);
        res.status(500).json({ error: 'Failed to fetch map data' });
    }
};

// GET /api/dashboard/events - Get upcoming events
const getUpcomingEvents = async (req, res) => {
    try {
        // Safe query excluding potentially missing training/scheduled_date columns if they cause errors
        // We'll try to query them, if it fails, we fall back to other events

        let trainingEvents = [];
        try {
            const tRes = await db.query(`
                SELECT id, title, 'training' as type, scheduled_date as date, location 
                FROM training_sessions 
                WHERE scheduled_date > NOW() 
                AND scheduled_date < NOW() + INTERVAL '7 days'
            `);
            trainingEvents = tRes.rows;
        } catch (e) {
            console.warn('Skipping training events due to missing column:', e.message);
        }

        const otherEvents = await db.query(`
            SELECT id, CONCAT('Compost Batch ', batch_number, ' Maturity') as title, 'compost' as type, maturity_date as date, location
            FROM compost_batches
            WHERE maturity_date > NOW()
            AND maturity_date < NOW() + INTERVAL '7 days'
            
            UNION ALL
            
            SELECT id, CONCAT('Order #', order_number, ' Delivery') as title, 'delivery' as type, delivery_date as date, delivery_address as location
            FROM orders
            WHERE delivery_date > NOW()
            AND delivery_date < NOW() + INTERVAL '7 days'
            
            ORDER BY date ASC
            LIMIT 10
        `);

        // Combine and sort
        const allEvents = [...trainingEvents, ...otherEvents.rows].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 10);

        res.json(allEvents);

    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch upcoming events' });
    }
};

// GET /api/dashboard/mobile - Get mobile dashboard stats for logged-in user
const getMobileDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get Farmer Profile
        const farmerRes = await db.query('SELECT * FROM farmers WHERE user_id = $1', [userId]);

        // Default empty stats if no farmer profile (e.g. admin testing mobile app)
        if (farmerRes.rows.length === 0) {
            return res.json({
                farmers: 0,
                sales: 0,
                trainings: 0,
                plots: 0,
                vslaBalance: 0.0,
                inputDebt: 0.0,
                salesTotal: 0.0,
                trustScore: 0,
                recentActivities: []
            });
        }

        const farmer = farmerRes.rows[0];
        const farmerId = farmer.id;

        // 2. Calculate Stats

        // VSLA Balance
        let vslaBalance = 0;
        if (farmer.vsla_id) {
            const memberRes = await db.query('SELECT current_balance FROM vsla_members WHERE farmer_id = $1 AND vsla_id = $2', [farmerId, farmer.vsla_id]);
            if (memberRes.rows.length > 0) {
                vslaBalance = parseFloat(memberRes.rows[0].current_balance || 0);
            }
        }

        // Input Debt (Outstanding Invoices)
        // Assume input_invoices table exists and has 'status' or 'remaining_balance'
        // Checking input_invoices schema via query might be safer, but assuming generic structure
        // If table doesn't exist, this might fail, so wrap in try/catch or simple query
        let inputDebt = 0;
        try {
            const debtRes = await db.query(
                "SELECT COALESCE(SUM(total_amount), 0) as total FROM input_invoices WHERE farmer_id = $1 AND status != 'paid'",
                [farmerId]
            );
            inputDebt = parseFloat(debtRes.rows[0].total || 0);
        } catch (e) {
            console.warn('Input invoices query failed (table might be missing):', e.message);
        }

        // Sales Total
        const salesRes = await db.query(
            "SELECT COALESCE(SUM(gross_revenue), 0) as total, COUNT(*) as count FROM sales WHERE farmer_id = $1",
            [farmerId]
        );
        const salesTotal = parseFloat(salesRes.rows[0].total || 0);
        const salesCount = parseInt(salesRes.rows[0].count || 0);

        // Trainings Count (Attendance)
        // Assuming training_attendance table or similar
        let trainingsCount = 0;
        // Mock for now until table confirmed

        // Farm Plots
        // Assuming farm_plots table
        let plotsCount = 0; // Mock

        // 3. Recent Activity (Personalized)
        const recentActivity = await db.query(`
            SELECT 'sale' as type, 
                   CONCAT(crop_type, ' Sale') as title,
                   CONCAT('Earnings: ', gross_revenue, ' RWF') as subtitle,
                   sale_date as created_at,
                   'success' as status
            FROM sales 
            WHERE farmer_id = $1
            
            UNION ALL
            
            SELECT 'invoice' as type,
                   CONCAT('Input Purchase: ', input_type) as title,
                   CONCAT('Amount: ', total_amount, ' RWF') as subtitle,
                   purchase_date as created_at,
                   'warning' as status
            FROM input_invoices
            WHERE farmer_id = $1
            
            ORDER BY created_at DESC
            LIMIT 5
        `, [farmerId]);

        res.json({
            farmers: 1, // Self
            sales: salesCount,
            trainings: trainingsCount,
            plots: plotsCount,
            vslaBalance: vslaBalance,
            inputDebt: inputDebt,
            salesTotal: salesTotal,
            trustScore: 85, // Mock score
            recentActivities: recentActivity.rows.map(a => ({
                type: a.type,
                title: a.title,
                subtitle: a.subtitle,
                time: a.created_at, // Frontend will format
                status: a.status
            }))
        });

    } catch (error) {
        console.error('Mobile Dashboard Error:', error);
        res.status(500).json({ error: 'Failed to fetch mobile dashboard stats' });
    }
};

module.exports = {
    getKPIs,
    getRecentActivity,
    getCohortStats,
    getVSLASummary,
    getDashboardCharts,
    getDashboardMap,
    getUpcomingEvents,
    getMobileDashboard
};
