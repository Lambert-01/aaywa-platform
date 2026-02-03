require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'migration.log');

function log(message) {
    const msg = `${new Date().toISOString()} - ${message}\n`;
    console.log(message);
    try {
        fs.appendFileSync(logFile, msg);
    } catch (e) {
        // ignore
    }
}

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'aaywa_db',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

async function run() {
    log('Script started');
    log(`Config: user=${process.env.DB_USER}, host=${process.env.DB_HOST}, db=${process.env.DB_NAME}`);

    try {
        const client = await pool.connect();
        log('Connected to DB');

        log('Creating products table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        product_type VARCHAR(50) NOT NULL,
        box_size DECIMAL(5,2) NOT NULL,
        cohort_id INTEGER REFERENCES cohorts(id),
        harvest_date DATE NOT NULL,
        available_quantity INTEGER NOT NULL,
        price_per_kg DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        description TEXT,
        certifications JSONB,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        log('Products table created');

        log('Creating orders table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer_name VARCHAR(100) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        customer_email VARCHAR(100),
        customer_type VARCHAR(50),
        delivery_address TEXT NOT NULL,
        delivery_date DATE NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_status VARCHAR(20) DEFAULT 'pending',
        order_status VARCHAR(20) DEFAULT 'pending',
        tracking_number VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        log('Orders table created');

        log('Creating order_items table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        farmer_share DECIMAL(10,2) NOT NULL,
        sanza_share DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        log('Order Items table created');

        client.release();
        log('Done');
        process.exit(0);
    } catch (err) {
        log(`Error: ${err.message}`);
        process.exit(1);
    }
}

run();
