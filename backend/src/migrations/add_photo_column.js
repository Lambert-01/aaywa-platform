const pool = require('../config/database');

async function addPhotoColumn() {
    try {
        console.log('Adding photo_url column to farmers table...');

        await pool.query(`
            ALTER TABLE farmers 
            ADD COLUMN IF NOT EXISTS photo_url TEXT;
        `);

        console.log('✅ Successfully added photo_url column to farmers table');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

addPhotoColumn();
