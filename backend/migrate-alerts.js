const pool = require('./src/config/database');
const fs = require('fs');
const path = require('path');

/**
 * Database Migration Script
 * Runs the alerts schema SQL file
 */

async function runMigration() {
    try {
        console.log('📊 Starting database migration...');

        // Read the SQL file
        const sqlPath = path.join(__dirname, '../database/alerts_schema.sql');
        console.log('📄 Reading SQL file:', sqlPath);

        if (!fs.existsSync(sqlPath)) {
            throw new Error(`SQL file not found: ${sqlPath}`);
        }

        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('✓ SQL file read successfully');
        console.log('📝 Executing SQL...\n');

        // Execute the SQL
        const result = await pool.query(sql);
        console.log('✓ SQL executed successfully');

        console.log('\n✅ Migration completed successfully!');
        console.log('   - Alerts table created');
        console.log('   - Indexes created');
        console.log('   - Triggers configured');

        // Test the table
        const testQuery = await pool.query('SELECT COUNT(*) FROM alerts');
        console.log(`   - Verified: alerts table has ${testQuery.rows[0].count} rows`);

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

runMigration();
