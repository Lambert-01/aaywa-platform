const pool = require('../src/config/database');

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migration for plot_boundary...');
        await client.query('BEGIN');

        await client.query(`
            ALTER TABLE farmers 
            ADD COLUMN IF NOT EXISTS plot_boundary JSONB;
        `);

        console.log('plot_boundary column added to farmers table');
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
