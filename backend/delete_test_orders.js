const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = require('./src/config/database');

async function deleteTestOrders() {
    let log = '';
    try {
        log += 'Connecting...\n';
        // Check if pool is connected or connect manually
        const client = await pool.connect();
        log += 'Connected!\n';

        const res = await client.query(`
            DELETE FROM orders 
            WHERE order_number IN ('AAY-2026-001', 'AAY-2026-002')
            OR delivery_address ILIKE '%4retgffdsdfv%'
            OR delivery_address ILIKE '%bbnmb b%'
            RETURNING order_number;
        `);
        
        log += `Deleted ${res.rowCount} orders: ${JSON.stringify(res.rows.map(r => r.order_number))}\n`;
        
        client.release();
    } catch (err) {
        log += `Error: ${err.message}\n`;
        console.error(err);
    } finally {
        await pool.end();
        log += 'Done.\n';
        fs.writeFileSync('delete_log.txt', log);
    }
}

deleteTestOrders();
