const { Pool } = require('pg');
require('dotenv').config();

console.log('Starting schema check...');
console.log('Database Config:', {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    port: process.env.DB_PORT
});

const pool = require('./src/config/database');

async function run() {
    try {
        console.log('Connecting...');
        const client = await pool.connect();
        console.log('Connected!');

        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'training_sessions';
        `);
        console.log('Columns found:', res.rows);

        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
        console.log('Pool closed');
    }
}

run();
