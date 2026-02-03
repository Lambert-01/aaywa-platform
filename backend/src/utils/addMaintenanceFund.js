const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function addMaintenanceFund() {
    try {
        console.log('🔄 Adding maintenance_fund column to vsla_groups...');

        await pool.query(`
            ALTER TABLE vsla_groups 
            ADD COLUMN IF NOT EXISTS maintenance_fund DECIMAL(10,2) DEFAULT 0;
        `);

        console.log('✅ Column added successfully (or already existed).');

        // Verify it exists now
        const res = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'vsla_groups' AND column_name = 'maintenance_fund';
        `);

        if (res.rows.length > 0) {
            console.log('✅ Verification passed: Column exists.');
        } else {
            console.error('❌ Verification failed: Column still missing.');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        pool.end();
    }
}

// Auto-run if called directly
if (require.main === module) {
    addMaintenanceFund().then(() => process.exit());
}

module.exports = addMaintenanceFund;
