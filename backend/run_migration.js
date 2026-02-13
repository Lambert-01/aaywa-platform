const fs = require('fs');
const path = require('path');
const db = require('./src/config/database');

/**
 * Run Database Migration
 * Usage: node run_migration.js <migration_file>
 * Example: node run_migration.js 001_add_sync_columns.sql
 */

async function runMigration(migrationFile) {
    try {
        console.log(`\n🔄 Running migration: ${migrationFile}\n`);

        const migrationPath = path.join(__dirname, 'src', 'migrations', migrationFile);

        if (!fs.existsSync(migrationPath)) {
            throw new Error(`Migration file not found: ${migrationPath}`);
        }

        const sql = fs.readFileSync(migrationPath, 'utf8');

        // Execute migration
        const result = await db.query(sql);

        console.log('✅ Migration completed successfully!');

        // Show status message if available
        if (result.rows && result.rows.length > 0) {
            console.log(`\n${result.rows[0].status}\n`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Get migration file from command line argument
const migrationFile = process.argv[2];

if (!migrationFile) {
    console.error('❌ Usage: node run_migration.js <migration_file>');
    console.error('Example: node run_migration.js 001_add_sync_columns.sql');
    process.exit(1);
}

runMigration(migrationFile);
