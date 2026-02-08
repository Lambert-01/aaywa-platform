const { Pool } = require('pg');
require('dotenv').config();
const pool = require('./src/config/database');

async function checkOrders() {
    try {
        const client = await pool.connect();
        const res = await client.query(`SELECT id, order_number, delivery_address, delivery_date FROM orders`);
        console.log('Orders found:', res.rows);
        client.release();
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkOrders();
