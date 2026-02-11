const pool = require('./src/config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const migrationPath = path.join(__dirname, 'src', 'migrations', '002_add_user_preferences.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    try {
        console.log('Running migration...');
        await pool.query(sql);
        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

runMigration();
