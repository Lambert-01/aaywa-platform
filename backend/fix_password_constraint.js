const pool = require('./src/config/database');

async function migrate() {
    try {
        console.log('--- Making password_hash Nullable Migration ---');
        await pool.query('ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL');
        console.log('✅ Successfully made password_hash nullable.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
