const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'aaywa_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
});

async function checkSchema() {
    try {
        console.log('Checking storage_facilities columns...');
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'storage_facilities';
        `);
        console.log('Columns:', res.rows.map(r => r.column_name).join(', '));

        console.log('\nChecking current data...');
        const data = await pool.query('SELECT id, name, location_name FROM storage_facilities');
        console.table(data.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

checkSchema();
