const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'aaywa_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
});

async function checkSchema() {
    const logFile = path.join(__dirname, 'debug_result.txt');
    const log = (msg) => fs.appendFileSync(logFile, msg + '\n');

    try {
        fs.writeFileSync(logFile, 'Starting Check...\n');

        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'storage_facilities';
        `);
        log('Columns: ' + res.rows.map(r => r.column_name).join(', '));

        const data = await pool.query('SELECT id, name, location_name FROM storage_facilities ORDER BY id DESC LIMIT 5');
        log('Recent Data: ' + JSON.stringify(data.rows, null, 2));

        // Let's also check if there's a trigger or something
    } catch (err) {
        log('Error: ' + err.message);
    } finally {
        pool.end();
    }
}

checkSchema();
