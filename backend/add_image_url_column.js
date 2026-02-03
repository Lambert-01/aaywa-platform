const pool = require('../src/config/database');

async function migrate() {
    try {
        console.log('Checking for image_url column in products table...');

        // Check if column exists
        const checkQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='products' AND column_name='image_url';
        `;
        const { rows } = await pool.query(checkQuery);

        if (rows.length === 0) {
            console.log('Column image_url does not exist. Adding it...');
            await pool.query('ALTER TABLE products ADD COLUMN image_url VARCHAR(255)');
            console.log('Successfully added image_url column to products table.');
        } else {
            console.log('Column image_url already exists.');
        }
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
}

migrate();
