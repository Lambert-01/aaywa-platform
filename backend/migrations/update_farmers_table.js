const pool = require('../src/config/database');

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migration...');
        await client.query('BEGIN');

        // 1. Add new columns if they don't exist
        await client.query(`
      ALTER TABLE farmers 
      ADD COLUMN IF NOT EXISTS photo_url VARCHAR(255),
      ADD COLUMN IF NOT EXISTS status BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS plot_size DECIMAL(5,2),
      ADD COLUMN IF NOT EXISTS location_address TEXT,
      ADD COLUMN IF NOT EXISTS crops TEXT[], -- Array of crops
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS full_name VARCHAR(100);
    `);

        // 2. Make user_id nullable (we will migrate data then create new farmers without it)
        await client.query(`
      ALTER TABLE farmers ALTER COLUMN user_id DROP NOT NULL;
    `);

        // 3. Migrate existing data: Copy full_name and phone from users table to farmers table if they are null
        // This is a best-effort data migration for existing records linked to users
        await client.query(`
      UPDATE farmers f
      SET full_name = u.full_name, phone = u.phone
      FROM users u
      WHERE f.user_id = u.id AND f.full_name IS NULL;
    `);

        // 4. Clean up any invalid constraints if necessary (skipping strict constraint drops for safety, but making fields nullable/not-null as needed)
        // We want full_name and phone to be NOT NULL eventually, but we might have empty ones.

        console.log('Migration completed successfully');
        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration failed', e);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
