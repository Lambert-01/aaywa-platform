const pool = require('../config/database');

// Migration script to create marketplace tables
async function migrate() {
    const client = await pool.connect();

    try {
        console.log('Starting marketplace tables migration...');

        // Create products table
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

        console.log('✓ Products table created');

        // Create orders table
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

        console.log('✓ Orders table created');

        // Create order_items table
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

        console.log('✓ Order items table created');

        console.log('Marketplace tables migration completed successfully!');
    } catch (error) {
        console.error('Migration error:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run migration
if (require.main === module) {
    migrate()
        .then(() => {
            console.log('Migration finished');
            process.exit(0);
        })
        .catch(err => {
            console.error('Migration failed:', err);
            process.exit(1);
        });
}

module.exports = migrate;
