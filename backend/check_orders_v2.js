const { Pool } = require('pg');
require('dotenv').config();

console.log('Connecting to DB...');
const connectionString = process.env.DATABASE_URL || `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
console.log('Conn string:', connectionString);

const pool = new Pool({ connectionString });

async function checkOrders() {
    try {
        const client = await pool.connect();
        console.log('Connected!');
        const res = await client.query(`SELECT id, order_number, delivery_address, delivery_date FROM orders`);
        console.log('Orders found:', res.rows);
        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
        console.log('Done.');
    }
}

checkOrders();
