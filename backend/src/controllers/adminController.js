const db = require('../config/database');

/**
 * Admin Controller
 * Provides administrative analytics, system health, and management functions
 */

// GET /api/admin/executive-summary - Get strategic KPIs for administrators
const getExecutiveSummary = async (req, res) => {
    try {
        // Program Performance Metrics
        const farmerStats = await db.query(`
            SELECT 
                COUNT(*)::int as total_farmers,
                COUNT(CASE WHEN is_active = true THEN 1 END)::int as active_farmers,
                AVG(plot_size_hectares)::float as avg_plot_size
            FROM farmers
        `);

        const staffStats = await db.query(`
            SELECT 
                COUNT(*)::int as total_staff,
                COUNT(CASE WHEN role = 'field_facilitator' THEN 1 END)::int as field_staff
            FROM users
            WHERE role IN ('field_facilitator', 'agronomist')
        `);

        const landStats = await db.query(`
            SELECT 
                COALESCE(SUM(plot_size_hectares), 0)::float as total_hectares,
                COUNT(*)::int as mapped_plots
            FROM farmers 
            WHERE plot_size_hectares IS NOT NULL
        `);

        const trainingStats = await db.query(`
            SELECT 
                COUNT(*)::int as total_sessions,
                COUNT(CASE WHEN status = 'completed' THEN 1 END)::int as completed_sessions,
                COALESCE(AVG(actual_attendees::float / NULLIF(expected_attendees, 0) * 100), 0)::int as avg_attendance_rate
            FROM training_sessions
        `);

        // Financial Overview
        const vslaStats = await db.query(`
            SELECT 
                COALESCE(SUM(total_savings), 0)::float as total_savings,
                COALESCE(SUM(seed_capital), 0)::float as total_capital,
                COUNT(*)::int as total_groups
            FROM vsla_groups
        `);

        const salesStats = await db.query(`
            SELECT 
                COALESCE(SUM(gross_revenue), 0)::float as total_revenue,
                COALESCE(SUM(farmer_share), 0)::float as farmer_earnings,
                COALESCE(SUM(sanza_share), 0)::float as sanza_earnings,
                COUNT(*)::int as total_sales
            FROM sales
        `);

        const inputStats = await db.query(`
            SELECT 
                COALESCE(SUM(total_cost), 0)::float as total_distributed,
                COUNT(*)::int as total_invoices
            FROM input_invoices
        `);

        // Operational Efficiency
        const visitStats = await db.query(`
            SELECT 
                COUNT(*)::int as total_visits
            FROM training_sessions
            WHERE date >= NOW() - INTERVAL '30 days'
        `);

        const qualityStats = await db.query(`
            SELECT 
                COUNT(*)::int as total_batches,
                COALESCE(AVG(quality_score), 0)::int as avg_quality_score
            FROM compost_batches
            WHERE quality_score IS NOT NULL
        `);

        // Risk Indicators
        const riskStats = await db.query(`
            SELECT 
                COUNT(CASE WHEN trust_score < 50 THEN 1 END)::int as low_trust_farmers,
                COUNT(CASE WHEN plot_size_hectares < 0.25 THEN 1 END)::int as small_plots,
                COUNT(CASE WHEN is_active = false THEN 1 END)::int as inactive_farmers
            FROM farmers
        `);

        // Trends (Last 30 days vs Previous 30 days)
        const salesTrend = await db.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN sale_date >= NOW() - INTERVAL '30 days' THEN gross_revenue ELSE 0 END), 0)::float as current_period,
                COALESCE(SUM(CASE WHEN sale_date >= NOW() - INTERVAL '60 days' AND sale_date < NOW() - INTERVAL '30 days' THEN gross_revenue ELSE 0 END), 0)::float as previous_period
            FROM sales
        `);

        const trainingTrend = await db.query(`
            SELECT 
                COUNT(CASE WHEN date >= NOW() - INTERVAL '30 days' THEN 1 END)::int as current_period,
                COUNT(CASE WHEN date >= NOW() - INTERVAL '60 days' AND date < NOW() - INTERVAL '30 days' THEN 1 END)::int as previous_period
            FROM training_sessions
            WHERE status = 'completed'
        `);

        res.json({
            programPerformance: {
                totalFarmers: farmerStats.rows[0].total_farmers,
                activeFarmers: farmerStats.rows[0].active_farmers,
                totalStaff: staffStats.rows[0].total_staff,
                fieldStaff: staffStats.rows[0].field_staff,
                trainingCompletionRate: Math.round((trainingStats.rows[0].completed_sessions / trainingStats.rows[0].total_sessions) * 100) || 0,
                totalLandHectares: landStats.rows[0].total_hectares,
                avgPlotSize: farmerStats.rows[0].avg_plot_size,
                mappedPlots: landStats.rows[0].mapped_plots
            },
            financialOverview: {
                budgetAllocated: 1000000.0, // TODO: Add to database
                budgetSpent: inputStats.rows[0].total_distributed + 50000, // Rough estimate
                vslaFundTotal: vslaStats.rows[0].total_savings,
                salesRevenue: salesStats.rows[0].total_revenue,
                farmerEarnings: salesStats.rows[0].farmer_earnings,
                costPerFarmer: farmerStats.rows[0].active_farmers > 0
                    ? (inputStats.rows[0].total_distributed / farmerStats.rows[0].active_farmers)
                    : 0
            },
            operationalEfficiency: {
                fieldVisitsThisMonth: visitStats.rows[0].total_visits,
                trainingsDelivered: trainingStats.rows[0].completed_sessions,
                avgAttendanceRate: trainingStats.rows[0].avg_attendance_rate,
                qualityInspectionPassRate: qualityStats.rows[0].avg_quality_score,
                resourceUtilization: 75 // TODO: Calculate from inventory
            },
            riskIndicators: {
                lowTrustFarmers: riskStats.rows[0].low_trust_farmers,
                smallPlots: riskStats.rows[0].small_plots,
                inactiveFarmers: riskStats.rows[0].inactive_farmers,
                pendingSync: 0, // Mobile app metric
                overdueInspections: 0 // TODO: Implement inspection tracking
            },
            trends: {
                salesTrend: salesTrend.rows[0].current_period > salesTrend.rows[0].previous_period ? 'up' : 'down',
                salesChange: ((salesTrend.rows[0].current_period - salesTrend.rows[0].previous_period) / (salesTrend.rows[0].previous_period || 1) * 100).toFixed(1),
                trainingTrend: trainingTrend.rows[0].current_period > trainingTrend.rows[0].previous_period ? 'up' : 'down',
                trainingChange: trainingTrend.rows[0].current_period - trainingTrend.rows[0].previous_period
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error fetching executive summary:', error);
        res.status(500).json({ error: 'Failed to fetch executive summary' });
    }
};

// GET /api/admin/analytics/by-cohort - Multi-dimensional analysis by cohort
const getAnalyticsByCohort = async (req, res) => {
    try {
        const { startDate, endDate, metric } = req.query;

        const cohortAnalytics = await db.query(`
            SELECT 
                c.id,
                c.name as cohort_name,
                c.cropping_system,
                COUNT(DISTINCT f.id)::int as farmer_count,
                COALESCE(AVG(f.plot_size_hectares), 0)::float as avg_plot_size,
                COALESCE(SUM(s.gross_revenue), 0)::float as total_revenue,
                COALESCE(AVG(s.gross_revenue), 0)::float as avg_revenue_per_sale,
                COUNT(DISTINCT ts.id)::int as training_sessions,
                COALESCE(AVG(f.trust_score), 85)::int as avg_trust_score,
                COALESCE((SELECT SUM(total_savings) FROM vsla_groups WHERE cohort_id = c.id), 0)::float as vsla_savings
            FROM cohorts c
            LEFT JOIN farmers f ON c.id = f.cohort_id AND f.is_active = true
            LEFT JOIN sales s ON f.id = s.farmer_id 
                ${startDate ? "AND s.sale_date >= $1" : ""}
                ${endDate ? "AND s.sale_date <= $2" : ""}
            LEFT JOIN training_sessions ts ON c.id = ts.cohort_id AND ts.status = 'completed'
            WHERE c.status = 'active'
            GROUP BY c.id, c.name, c.cropping_system
            ORDER BY c.name
        `, startDate && endDate ? [startDate, endDate] : []);

        res.json(cohortAnalytics.rows);
    } catch (error) {
        console.error('Error fetching cohort analytics:', error);
        res.status(500).json({ error: 'Failed to fetch cohort analytics' });
    }
};

// GET /api/admin/analytics/by-crop - Analysis by crop type
const getAnalyticsByCrop = async (req, res) => {
    try {
        const cropAnalytics = await db.query(`
            SELECT 
                crop_type,
                COUNT(*)::int as sale_count,
                COALESCE(SUM(quantity_kg), 0)::float as total_quantity_kg,
                COALESCE(AVG(price_per_kg), 0)::float as avg_price_per_kg,
                COALESCE(SUM(gross_revenue), 0)::float as total_revenue,
                COALESCE(SUM(farmer_share), 0)::float as farmer_earnings
            FROM sales
            WHERE crop_type IS NOT NULL
            GROUP BY crop_type
            ORDER BY total_revenue DESC
        `);

        res.json(cropAnalytics.rows);
    } catch (error) {
        console.error('Error fetching crop analytics:', error);
        res.status(500).json({ error: 'Failed to fetch crop analytics' });
    }
};

// GET /api/admin/analytics/by-period - Time-based analysis
const getAnalyticsByPeriod = async (req, res) => {
    try {
        const { groupBy = 'month' } = req.query; // 'day', 'week', 'month'

        let dateFormat;
        if (groupBy === 'day') dateFormat = 'YYYY-MM-DD';
        else if (groupBy === 'week') dateFormat = 'YYYY-"W"WW';
        else dateFormat = 'YYYY-MM';

        const periodAnalytics = await db.query(`
            SELECT 
                TO_CHAR(sale_date, $1) as period,
                COUNT(*)::int as sale_count,
                COALESCE(SUM(gross_revenue), 0)::float as total_revenue,
                COALESCE(SUM(farmer_share), 0)::float as farmer_earnings,
                COALESCE(AVG(price_per_kg), 0)::float as avg_price
            FROM sales
            WHERE sale_date >= NOW() - INTERVAL '6 months'
            GROUP BY period
            ORDER BY period DESC
            LIMIT 50
        `, [dateFormat]);

        res.json(periodAnalytics.rows);
    } catch (error) {
        console.error('Error fetching period analytics:', error);
        res.status(500).json({ error: 'Failed to fetch period analytics' });
    }
};

// GET /api/admin/system-health - Get system health metrics
const getSystemHealth = async (req, res) => {
    try {
        // Data Quality Metrics
        const dataQuality = await db.query(`
            SELECT 
                COUNT(*)::int as total_farmers,
                COUNT(CASE WHEN phone IS NOT NULL THEN 1 END)::int as has_phone,
                COUNT(CASE WHEN location_coordinates IS NOT NULL THEN 1 END)::int as has_location,
                COUNT(CASE WHEN plot_size_hectares IS NOT NULL THEN 1 END)::int as has_plot_size,
                COUNT(CASE WHEN cohort_id IS NOT NULL THEN 1 END)::int as has_cohort
            FROM farmers
        `);

        const completenessScore = Math.round(
            ((dataQuality.rows[0].has_phone +
                dataQuality.rows[0].has_location +
                dataQuality.rows[0].has_plot_size +
                dataQuality.rows[0].has_cohort) /
                (dataQuality.rows[0].total_farmers * 4)) * 100
        );

        // User Activity
        const userActivity = await db.query(`
            SELECT 
                COUNT(DISTINCT CASE WHEN last_login >= NOW() - INTERVAL '1 day' THEN id END)::int as daily_active,
                COUNT(DISTINCT CASE WHEN last_login >= NOW() - INTERVAL '7 days' THEN id END)::int as weekly_active,
                COUNT(DISTINCT CASE WHEN last_login >= NOW() - INTERVAL '30 days' THEN id END)::int as monthly_active,
                COUNT(*)::int as total_users
            FROM users
        `);

        // Database Statistics
        const dbStats = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM farmers) as farmer_records,
                (SELECT COUNT(*) FROM sales) as sales_records,
                (SELECT COUNT(*) FROM training_sessions) as training_records,
                (SELECT COUNT(*) FROM input_invoices) as invoice_records
        `);

        res.json({
            dataQuality: {
                completenessScore: completenessScore,
                missingData: {
                    phone: dataQuality.rows[0].total_farmers - dataQuality.rows[0].has_phone,
                    location: dataQuality.rows[0].total_farmers - dataQuality.rows[0].has_location,
                    plotSize: dataQuality.rows[0].total_farmers - dataQuality.rows[0].has_plot_size,
                    cohort: dataQuality.rows[0].total_farmers - dataQuality.rows[0].has_cohort
                },
                totalRecords: dataQuality.rows[0].total_farmers
            },
            userActivity: {
                dailyActive: userActivity.rows[0].daily_active,
                weeklyActive: userActivity.rows[0].weekly_active,
                monthlyActive: userActivity.rows[0].monthly_active,
                totalUsers: userActivity.rows[0].total_users
            },
            database: {
                farmers: dbStats.rows[0].farmer_records,
                sales: dbStats.rows[0].sales_records,
                trainings: dbStats.rows[0].training_records,
                invoices: dbStats.rows[0].invoice_records
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error fetching system health:', error);
        res.status(500).json({ error: 'Failed to fetch system health metrics' });
    }
};

// GET /api/admin/users - Get all users with filters
const getAllUsers = async (req, res) => {
    try {
        const { role, status, search } = req.query;

        let query = `
            SELECT 
                u.id,
                u.full_name,
                u.email,
                u.phone,
                u.role,
                u.is_active,
                u.last_login,
                u.created_at,
                f.id as farmer_id,
                f.cohort_id,
                c.name as cohort_name
            FROM users u
            LEFT JOIN farmers f ON u.id = f.user_id
            LEFT JOIN cohorts c ON f.cohort_id = c.id
            WHERE 1=1
        `;

        const params = [];
        let paramIndex = 1;

        if (role) {
            query += ` AND u.role = $${paramIndex++}`;
            params.push(role);
        }

        if (status === 'active') {
            query += ` AND u.is_active = true`;
        } else if (status === 'inactive') {
            query += ` AND u.is_active = false`;
        }

        if (search) {
            query += ` AND (u.full_name ILIKE $${paramIndex++} OR u.email ILIKE $${paramIndex++})`;
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ` ORDER BY u.created_at DESC LIMIT 100`;

        const users = await db.query(query, params);

        res.json(users.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// PUT /api/admin/users/:id/status - Update user status
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        await db.query(
            'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2',
            [is_active, id]
        );

        res.json({
            message: is_active ? 'User activated successfully' : 'User deactivated successfully'
        });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ error: 'Failed to update user status' });
    }
};

module.exports = {
    getExecutiveSummary,
    getAnalyticsByCohort,
    getAnalyticsByCrop,
    getAnalyticsByPeriod,
    getSystemHealth,
    getAllUsers,
    updateUserStatus
};
