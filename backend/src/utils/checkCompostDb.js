const pool = require('./config/database');

async function checkDatabase() {
    console.log('🔍 Checking database connection and schema...\n');

    try {
        // Test connection
        const connectionTest = await pool.query('SELECT NOW()');
        console.log('✅ Database connection successful');
        console.log('   Server time:', connectionTest.rows[0].now);

        // Check for compost tables
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name LIKE 'compost%'
            ORDER BY table_name
        `);

        console.log('\n📊 Compost Tables Found:');
        if (tablesResult.rows.length === 0) {
            console.log('   ❌ No compost tables found!');
            console.log('   ⚠️  You need to run the SQL schema file first.');
            console.log('   📁 File: database/compost_schema.sql');
            console.log('\n   Instructions:');
            console.log('   1. Open pgAdmin');
            console.log('   2. Connect to aaywa_platform database');
            console.log('   3. Open Query Tool (Tools → Query Tool)');
            console.log('   4. Load database/compost_schema.sql');
            console.log('   5. Execute the script (F5 or ▶️ button)');
        } else {
            tablesResult.rows.forEach(row => {
                console.log('   ✅', row.table_name);
            });

            // Count existing batches
            const batchCount = await pool.query('SELECT COUNT(*) FROM compost_batches');
            console.log('\n📦 Existing Batches:', batchCount.rows[0].count);

            // Count feedstock items
            const feedstockCount = await pool.query('SELECT COUNT(*) FROM compost_feedstock_items');
            console.log('🌾 Feedstock Items:', feedstockCount.rows[0].count);

            // Count sales
            const salesCount = await pool.query('SELECT COUNT(*) FROM compost_sales');
            console.log('💰 Sales Records:', salesCount.rows[0].count);

            if (batchCount.rows[0].count === '0') {
                console.log('\n⚠️  No data found. You should run the seeding script:');
                console.log('   npm run seed:compost');
                console.log('   OR: node src/utils/seedCompost.js');
            } else {
                console.log('\n✅ Database is ready! Compost data exists.');
            }
        }

    } catch (error) {
        console.error('\n❌ Database Error:', error.message);
        console.error('\n🔧 Check your database configuration in backend/.env:');
        console.error('   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME');
    } finally {
        await pool.end();
        process.exit();
    }
}

checkDatabase();
