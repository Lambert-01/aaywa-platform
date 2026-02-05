const pool = require('../config/database');

/**
 * Get unified farmer profile with all related data
 * Includes: farmer details, VSLA info, sales history, training attendance, compost workdays
 */
const getFarmerUnifiedProfile = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Farmer Basic Info
        const farmer = await pool.query(`
      SELECT 
        f.id, f.full_name, f.phone, f.date_of_birth, f.gender,
        f.household_type, f.location_coordinates, f.plot_size_hectares,
        f.is_active, f.created_at,
        c.id as cohort_id, c.name as cohort_name, c.cropping_system,
        v.id as vsla_id, v.name as vsla_name
      FROM farmers f
      LEFT JOIN cohorts c ON f.cohort_id = c.id
      LEFT JOIN vsla_groups v ON f.vsla_id = v.id
      WHERE f.id = $1
    `, [id]);

        if (farmer.rows.length === 0) {
            return res.status(404).json({ error: 'Farmer not found' });
        }

        const farmerData = farmer.rows[0];

        // 2. VSLA Balance & Transaction Summary
        const vslaData = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'savings' THEN amount ELSE 0 END), 0) as total_savings,
        COALESCE(SUM(CASE WHEN type = 'loan' AND status = 'active' THEN amount ELSE 0 END), 0) as active_loans,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as transactions_last_month
      FROM vsla_transactions
      WHERE farmer_id = $1 OR member_id = $1
    `, [id]);

        // 3. Sales History
        const sales = await pool.query(`
      SELECT 
        id, crop_type, quantity_kg, gross_revenue, net_revenue,
        farmer_share, sale_date, buyer_name
      FROM sales
      WHERE farmer_id = $1
      ORDER BY sale_date DESC
      LIMIT 10
    `, [id]);

        const salesSummary = await pool.query(`
      SELECT 
        COUNT(*) as total_sales,
        COALESCE(SUM(quantity_kg), 0) as total_quantity_sold,
        COALESCE(SUM(farmer_share), 0) as total_income
      FROM sales
      WHERE farmer_id = $1 AND sale_date >= NOW() - INTERVAL '12 months'
    `, [id]);

        // 4. Training Attendance
        const training = await pool.query(`
      SELECT 
        ts.id, ts.title, ts.topic, ts.scheduled_date,
        ta.attendance_status, ta.completion_status
      FROM training_attendance ta
      JOIN training_sessions ts ON ta.session_id = ts.id
      WHERE ta.farmer_id = $1
      ORDER BY ts.scheduled_date DESC
      LIMIT 10
    `, [id]);

        const trainingStats = await pool.query(`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN attendance_status = 'present' THEN 1 END) as attended,
        ROUND(COUNT(CASE WHEN attendance_status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 1) as attendance_rate
      FROM training_attendance
      WHERE farmer_id = $1
    `, [id]);

        // 5. Compost Workdays
        const compost = await pool.query(`
      SELECT 
        cw.id, cw.workday_date, cw.hours_worked, cw.stipend_amount,
        cw.payment_status, cw.payment_date,
        cb.batch_number
      FROM compost_workdays cw
      JOIN compost_batches cb ON cw.batch_id = cb.id
      WHERE cw.farmer_id = $1
      ORDER BY cw.workday_date DESC
      LIMIT 10
    `, [id]);

        const compostSummary = await pool.query(`
      SELECT 
        COUNT(*) as total_workdays,
        COALESCE(SUM(hours_worked), 0) as total_hours,
        COALESCE(SUM(stipend_amount), 0) as total_stipend_earned,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN stipend_amount ELSE 0 END), 0) as stipend_paid
      FROM compost_workdays
      WHERE farmer_id = $1
    `, [id]);

        // Assemble unified profile
        const unifiedProfile = {
            farmer: farmerData,
            vsla: {
                balance: parseFloat(vslaData.rows[0]?.total_savings || 0),
                activeLoans: parseFloat(vslaData.rows[0]?.active_loans || 0),
                recentActivity: parseInt(vslaData.rows[0]?.transactions_last_month || 0)
            },
            sales: {
                recent: sales.rows,
                summary: {
                    totalSales: parseInt(salesSummary.rows[0]?.total_sales || 0),
                    totalQuantity: parseFloat(salesSummary.rows[0]?.total_quantity_sold || 0),
                    totalIncome: parseFloat(salesSummary.rows[0]?.total_income || 0)
                }
            },
            training: {
                recent: training.rows,
                stats: {
                    totalSessions: parseInt(trainingStats.rows[0]?.total_sessions || 0),
                    attended: parseInt(trainingStats.rows[0]?.attended || 0),
                    attendanceRate: parseFloat(trainingStats.rows[0]?.attendance_rate || 0)
                }
            },
            compost: {
                recent: compost.rows,
                summary: {
                    totalWorkdays: parseInt(compostSummary.rows[0]?.total_workdays || 0),
                    totalHours: parseFloat(compostSummary.rows[0]?.total_hours || 0),
                    totalStipend: parseFloat(compostSummary.rows[0]?.total_stipend_earned || 0),
                    stipendPaid: parseFloat(compostSummary.rows[0]?.stipend_paid || 0)
                }
            }
        };

        res.json(unifiedProfile);
    } catch (error) {
        console.error('Error fetching unified farmer profile:', error);
        res.status(500).json({ error: 'Failed to fetch farmer profile' });
    }
};

module.exports = {
    getFarmerUnifiedProfile
};
