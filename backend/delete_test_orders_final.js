const { Pool } = require('pg');
require('dotenv').config();

const pool = require('./src/config/database');

async function deleteTestOrders() {
    try {
        console.log('Connecting...');
        const client = await pool.connect();

        console.log('Deleting test orders...');
        const res = await client.query(`
            DELETE FROM orders 
            WHERE order_number IN ('AAY-2026-001', 'AAY-2026-002')
            RETURNING order_number;
        `);

        console.log(`Deleted ${res.rowCount} orders:`, res.rows.map(r => r.order_number));

        client.release();
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

deleteTestOrders();
