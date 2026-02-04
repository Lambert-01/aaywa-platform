const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'aaywa_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
});

async function migrate() {
    try {
        console.log('Ensuring columns exist in storage_facilities...');

        await pool.query(`
            ALTER TABLE storage_facilities 
            ADD COLUMN IF NOT EXISTS location_name TEXT,
            ADD COLUMN IF NOT EXISTS temperature_min DECIMAL(5,2),
            ADD COLUMN IF NOT EXISTS temperature_max DECIMAL(5,2);
        `);

        console.log('✅ Columns location_name, temperature_min, temperature_max checked/added.');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        pool.end();
    }
}

migrate();
