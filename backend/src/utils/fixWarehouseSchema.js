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

async function fixWarehouseSchema() {
    try {
        console.log('🔧 Fixing warehouse schema...\n');

        // Add missing columns to storage_facilities
        console.log('Adding missing columns to storage_facilities...');

        const alterations = [
            'ALTER TABLE storage_facilities ADD COLUMN IF NOT EXISTS description TEXT',
            'ALTER TABLE storage_facilities ADD COLUMN IF NOT EXISTS temperature_min DECIMAL(5,2)',
            'ALTER TABLE storage_facilities ADD COLUMN IF NOT EXISTS temperature_max DECIMAL(5,2)',
            'ALTER TABLE storage_facilities ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10,6)',
            'ALTER TABLE storage_facilities ADD COLUMN IF NOT EXISTS location_lng DECIMAL(10,6)'
        ];

        for (const sql of alterations) {
            await pool.query(sql);
            console.log(`✅ ${sql}`);
        }

        // Verify columns
        const result = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'storage_facilities'
            ORDER BY column_name
        `);

        console.log('\n📋 Current storage_facilities columns:');
        result.rows.forEach(row => {
            console.log(`  ✓ ${row.column_name} (${row.data_type})`);
        });

        console.log('\n✅ Schema fix completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

fixWarehouseSchema();
