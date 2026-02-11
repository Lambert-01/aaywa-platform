const pool = require('../src/config/database');

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migration for vsla_attendance...');
        await client.query('BEGIN');

        await client.query(`
            CREATE TABLE IF NOT EXISTS vsla_attendance (
                id SERIAL PRIMARY KEY,
                vsla_id INTEGER REFERENCES vsla_groups(id),
                farmer_id INTEGER REFERENCES farmers(id),
                status VARCHAR(20) DEFAULT 'present',
                date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(vsla_id, farmer_id, date)
            );
        `);

        console.log('vsla_attendance table created successfully');
        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration failed', e);
    } finally {
        client.release();
        // pool.end(); // Keep pool open if running via some runner, but for standalone script we should end it. 
        // The previous script had pool.end() inside finally but that might be risky if client release is async? 
        // Actually pool.end() returns a promise.
        await pool.end();
    }
}

migrate();
