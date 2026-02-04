const pool = require('../config/database');

async function checkTables() {
    try {
        console.log('Checking warehouse tables...');

        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('storage_facilities', 'inventory_transactions', 'temperature_logs', 'maintenance_records', 'post_harvest_losses')
            ORDER BY table_name
        `);

        console.log('\nFound tables:');
        result.rows.forEach(row => {
            console.log(`  ✅ ${row.table_name}`);
        });

        if (result.rows.length === 0) {
            console.log('  ❌ No warehouse tables found!');
            console.log('\nAttempting to create tables...');

            // Try to create storage_facilities as a test
            await pool.query(`
                CREATE TABLE IF NOT EXISTS storage_facilities (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    type VARCHAR(50) NOT NULL,
                    location_name VARCHAR(255),
                    capacity_kg DECIMAL(10,2) NOT NULL,
                    current_usage_kg DECIMAL(10,2) DEFAULT 0,
                    temperature_celsius DECIMAL(5,2),
                    humidity_percent DECIMAL(5,2),
                    status VARCHAR(50) DEFAULT 'operational',
                    maintenance_due_date TIMESTAMP,
                    last_maintenance_date TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS inventory_transactions (
                    id SERIAL PRIMARY KEY,
                    facility_id INTEGER REFERENCES storage_facilities(id),
                    crop_type VARCHAR(100) NOT NULL,
                    quantity_kg DECIMAL(10,2) NOT NULL,
                    direction VARCHAR(20) NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
                    reason VARCHAR(100) NOT NULL,
                    quality_grade VARCHAR(10),
                    temperature_at_transaction DECIMAL(5,2),
                    related_farmer_id INTEGER,
                    related_order_id INTEGER,
                    notes TEXT,
                    status VARCHAR(50) DEFAULT 'completed',
                    created_by INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS temperature_logs (
                    id SERIAL PRIMARY KEY,
                    facility_id INTEGER REFERENCES storage_facilities(id),
                    temperature_celsius DECIMAL(5,2) NOT NULL,
                    humidity_percent DECIMAL(5,2),
                    alert_triggered BOOLEAN DEFAULT FALSE,
                    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS maintenance_records (
                    id SERIAL PRIMARY KEY,
                    facility_id INTEGER REFERENCES storage_facilities(id),
                    issue_description TEXT NOT NULL,
                    maintenance_type VARCHAR(50),
                    cost DECIMAL(10,2),
                    vendor_name VARCHAR(255),
                    status VARCHAR(50) DEFAULT 'scheduled',
                    scheduled_date TIMESTAMP,
                    completed_date TIMESTAMP,
                    created_by INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS post_harvest_losses (
                    id SERIAL PRIMARY KEY,
                    transaction_id INTEGER REFERENCES inventory_transactions(id),
                    loss_category VARCHAR(100),
                    loss_quantity_kg DECIMAL(10,2),
                    loss_value DECIMAL(10,2),
                    root_cause TEXT,
                    prevention_strategy TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            console.log('✅ Tables created successfully!');
        } else {
            console.log(`\n✅ Found ${result.rows.length}/5 warehouse tables`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkTables();
