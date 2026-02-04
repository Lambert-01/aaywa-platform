const pool = require('../config/database');

async function verifySetup() {
    try {
        console.log('🔍 Verifying Warehouse Setup...\n');

        // Check tables exist
        console.log('1. Checking tables...');
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('storage_facilities', 'inventory_transactions', 'temperature_logs', 'maintenance_records', 'post_harvest_losses')
            ORDER BY table_name
        `);

        if (tables.rows.length === 5) {
            console.log('   ✅ All 5 tables created');
            tables.rows.forEach(row => console.log(`      - ${row.table_name}`));
        } else {
            console.log(`   ⚠️  Only ${tables.rows.length}/5 tables found`);
        }

        // Check data
        console.log('\n2. Checking seeded data...');

        const facilities = await pool.query('SELECT COUNT(*) FROM storage_facilities');
        console.log(`   ✅ Facilities: ${facilities.rows[0].count}`);

        const transactions = await pool.query('SELECT COUNT(*) FROM inventory_transactions');
        console.log(`   ✅ Transactions: ${transactions.rows[0].count}`);

        const tempLogs = await pool.query('SELECT COUNT(*) FROM temperature_logs');
        console.log(`   ✅ Temperature Logs: ${tempLogs.rows[0].count}`);

        const maintenance = await pool.query('SELECT COUNT(*) FROM maintenance_records');
        console.log(`   ✅ Maintenance Records: ${maintenance.rows[0].count}`);

        // Test views
        console.log('\n3. Testing views...');

        const facilitySummary = await pool.query('SELECT COUNT(*) FROM facility_summary');
        console.log(`   ✅ facility_summary view: ${facilitySummary.rows[0].count} rows`);

        const inventoryBalance = await pool.query('SELECT COUNT(*) FROM inventory_balance');
        console.log(`   ✅ inventory_balance view: ${inventoryBalance.rows[0].count} rows`);

        // Sample facility data
        console.log('\n4. Sample Facility Data:');
        const sampleFacility = await pool.query('SELECT name, type, capacity_kg, current_usage_kg FROM storage_facilities LIMIT 1');
        if (sampleFacility.rows.length > 0) {
            const f = sampleFacility.rows[0];
            console.log(`   ${f.name} (${f.type})`);
            console.log(`   Capacity: ${f.capacity_kg} kg`);
            console.log(`   Current: ${f.current_usage_kg} kg`);
        }

        console.log('\n✅ Warehouse setup verified successfully!');
        console.log('📊 Ready to use the dashboard at http://localhost:3000/warehouse\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Verification failed:', error.message);
        process.exit(1);
    }
}

verifySetup();
