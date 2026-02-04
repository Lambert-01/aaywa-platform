const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Load .env from backend directory
require('dotenv').config({ path: path.join(__dirname, '../../../backend/.env') });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'aaywa_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

async function applyWarehouseSchema() {
    try {
        console.log('📦 Applying Warehouse Schema...');
        console.log(`   Database: ${process.env.DB_NAME}`);
        console.log(`   Host: ${process.env.DB_HOST}`);
        console.log(`   User: ${process.env.DB_USER}`);

        // Read the SQL file
        const schemaPath = path.join(__dirname, '../../../database/warehouse_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Execute the SQL
        await pool.query(schemaSql);

        console.log('✅ Warehouse schema applied successfully!');
        console.log('   - storage_facilities table created');
        console.log('   - inventory_transactions table created');
        console.log('   - temperature_logs table created');
        console.log('   - maintenance_records table created');
        console.log('   - post_harvest_losses table created');
        console.log('   - Views and indexes created');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error applying schema:', error.message);
        process.exit(1);
    }
}

applyWarehouseSchema();
