const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function migrateTransactions() {
    try {
        console.log('🔄 Migrating vsla_transactions table...');

        const columns = [
            'ADD COLUMN IF NOT EXISTS repayment_date DATE',
            'ADD COLUMN IF NOT EXISTS interest_rate DECIMAL(5,2)',
            'ADD COLUMN IF NOT EXISTS work_type VARCHAR(50)',
            'ADD COLUMN IF NOT EXISTS days_worked INTEGER',
            'ADD COLUMN IF NOT EXISTS vendor_name VARCHAR(100)',
            'ADD COLUMN IF NOT EXISTS receipt_url VARCHAR(255)',
            'ADD COLUMN IF NOT EXISTS sale_reference VARCHAR(50)'
        ];

        for (const col of columns) {
            await pool.query(`ALTER TABLE vsla_transactions ${col};`);
            console.log(`   Processed: ${col}`);
        }

        console.log('✅ Migration successful! Transaction columns added.');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        pool.end();
    }
}

// Auto-run if called directly
if (require.main === module) {
    migrateTransactions().then(() => process.exit());
}

module.exports = migrateTransactions;
