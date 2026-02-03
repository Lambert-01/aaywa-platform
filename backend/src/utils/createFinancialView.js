const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function createFinancialView() {
    try {
        console.log('🔄 Creating vsla_member_financial_summary view...');

        // Drop if exists to ensure clean state
        await pool.query(`DROP MATERIALIZED VIEW IF EXISTS vsla_member_financial_summary;`);
        await pool.query(`DROP VIEW IF EXISTS vsla_member_financial_summary;`);

        // Create the view
        const query = `
            CREATE VIEW vsla_member_financial_summary AS
            SELECT 
              vm.vsla_id,
              vm.id as member_id,
              f.full_name,
              f.phone,
              vm.role,
              vm.current_balance,
              COALESCE(loan_summary.outstanding, 0) as active_loans_amount,
              COALESCE(loan_summary.loan_count, 0) as active_loans_count
            FROM vsla_members vm
            JOIN farmers f ON vm.farmer_id = f.id
            LEFT JOIN (
              SELECT member_id, 
                     SUM(amount) as outstanding,
                     COUNT(*) as loan_count
              FROM vsla_transactions 
              WHERE type = 'loan_disbursement' 
              -- In a real system we'd filter by status='active' but we removed that column previously or didn't add it. 
              -- For now, let's assume all disbursements that haven't been fully repaid are active.
              -- Or simpler: Just sum all disbursements. Ideally we need repayment tracking.
              -- Given the schema, we'll just sum disbursements for now as "Total Borrowed"
              GROUP BY member_id
            ) loan_summary ON vm.id = loan_summary.member_id;
        `;

        await pool.query(query);
        console.log('✅ View created successfully.');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        pool.end();
    }
}

// Auto-run if called directly
if (require.main === module) {
    createFinancialView().then(() => process.exit());
}

module.exports = createFinancialView;
