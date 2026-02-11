const pool = require('./src/config/database');

async function migrate() {
    try {
        console.log('Checking and fixing database schema...');

        // 1. Add user_id to farmers if missing
        console.log('Adding user_id to farmers table...');
        await pool.query(`
      ALTER TABLE farmers 
      ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
    `);

        // 2. Ensure farmers have location_coordinates
        console.log('Ensuring location_coordinates column...');
        await pool.query(`
      ALTER TABLE farmers 
      ADD COLUMN IF NOT EXISTS location_coordinates JSONB;
    `);

        console.log('✅ Schema update successful!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
