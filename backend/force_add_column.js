const pool = require('./src/config/database');

async function forceMigration() {
    try {
        console.log('Attempting to add image_url column...');

        // Use a direct alter table command wrapped in try/catch for safety
        try {
            await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR(255)');
            console.log('✅ Successfully added image_url column (or it already existed).');
        } catch (alterError) {
            console.error('⚠️ Error during ALTER TABLE:', alterError.message);
        }

        // Verify it exists now
        const check = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='products' AND column_name='image_url'
        `);

        if (check.rows.length > 0) {
            console.log('✅ VERIFICATION PASS: image_url column exists.');
        } else {
            console.error('❌ VERIFICATION FAIL: image_url column is MISSING.');
        }

    } catch (error) {
        console.error('Migration script error:', error);
    } finally {
        await pool.end();
    }
}

forceMigration();
