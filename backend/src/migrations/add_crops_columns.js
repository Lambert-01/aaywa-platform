const pool = require('../config/database');

async function addCropsColumns() {
    try {
        console.log('Adding crops and co_crops columns to farmers table...');

        await pool.query(`
            ALTER TABLE farmers 
            ADD COLUMN IF NOT EXISTS crops TEXT,
            ADD COLUMN IF NOT EXISTS co_crops TEXT;
        `);

        console.log('✅ Successfully added crops columns to farmers table');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

addCropsColumns();
