const pool = require('../src/config/database');

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migration for farmer profile fields...');
        await client.query('BEGIN');

        await client.query(`
            ALTER TABLE farmers 
            ADD COLUMN IF NOT EXISTS trust_score DECIMAL(5,2) DEFAULT 80.00,
            ADD COLUMN IF NOT EXISTS primary_crop VARCHAR(100),
            ADD COLUMN IF NOT EXISTS secondary_crops TEXT,
            ADD COLUMN IF NOT EXISTS years_farming INTEGER,
            ADD COLUMN IF NOT EXISTS location_name VARCHAR(200);
        `);

        console.log('Farmer profile fields added successfully');
        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration failed', e);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
