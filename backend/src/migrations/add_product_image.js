const pool = require('../config/database');

async function migrate() {
    try {
        console.log('Adding image_url column to products table...');

        await pool.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS image_url VARCHAR(255)
    `);

        console.log('✅ Migration successful: image_url column added.');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
