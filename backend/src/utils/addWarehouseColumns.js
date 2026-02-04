const pool = require('../config/database');

async function addMissingColumns() {
    try {
        console.log('📝 Adding missing columns to storage_facilities...');

        // Add columns if they don't exist
        await pool.query(`
            ALTER TABLE storage_facilities 
            ADD COLUMN IF NOT EXISTS temperature_min DECIMAL(5,2),
            ADD COLUMN IF NOT EXISTS temperature_max DECIMAL(5,2),
            ADD COLUMN IF NOT EXISTS description TEXT;
        `);

        console.log('✅ Columns added successfully!');

        // Verify columns
        const result = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'storage_facilities'
            ORDER BY column_name
        `);

        console.log('\nCurrent columns:');
        result.rows.forEach(row => {
            console.log(`  - ${row.column_name} (${row.data_type})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

addMissingColumns();
