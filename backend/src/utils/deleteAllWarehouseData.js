const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'aaywa_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
});

async function deleteAllWarehouseData() {
    try {
        console.log('🗑️  Deleting ALL warehouse data...\n');

        // Delete in correct order (child tables first due to foreign keys)
        const tables = [
            'post_harvest_losses',
            'maintenance_records',
            'temperature_logs',
            'inventory_transactions',
            'storage_facilities'
        ];

        for (const table of tables) {
            await pool.query(`DELETE FROM ${table}`);
            const count = await pool.query(`SELECT COUNT(*) FROM ${table}`);
            console.log(`✅ ${table}: ${count.rows[0].count} rows (deleted)`);
        }

        console.log('\n✅ All warehouse data deleted successfully!');
        console.log('📊 All tables are now empty.\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

deleteAllWarehouseData();
