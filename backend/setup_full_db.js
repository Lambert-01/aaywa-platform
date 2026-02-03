const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'aaywa_user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'aaywa_platform',
    password: process.env.DB_PASSWORD || 'aaywa_secure_2026',
    port: process.env.DB_PORT || 5432,
});

async function setupDatabase() {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting Database Setup...');

        // 1. Apply Schema
        console.log('📦 Creating Tables...');
        const schemaPath = path.join(__dirname, 'database_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schemaSql);
        console.log('✅ Tables created successfully.');

        // 2. Clear existing data to avoid duplicates (optional but safe for seeding)
        // console.log('🧹 Clearing old data...');
        // await client.query('TRUNCATE table farmers, cohorts, vsla_groups, sales, compost_batches, training_sessions CASCADE');

        // 3. Run Seeding Logic
        // We will require the seedDatabase.js function if exported, or just run it via child_process
        // But since seedDatabase.js runs on load (lines 263-264), we can just execute it as a separate process or require it.
        // However, requiring it might be tricky if it runs immediately.
        // Let's just tell the user to run it. 
        // OR, better, let's spawn it.

        console.log('🌱 Seeding Data...');
        const { execSync } = require('child_process');
        try {
            // Execute seedDatabase.js using the same node environment
            const output = execSync('node seedDatabase.js', {
                encoding: 'utf-8',
                stdio: 'inherit' // Pipe output to parent
            });
            console.log('✅ Seeding completed.');
        } catch (seedError) {
            console.error('❌ Seeding failed.');
            throw seedError;
        }

        // 4. Verification
        console.log('\n📊 Verifying Data...');
        const tables = ['farmers', 'cohorts', 'vsla_groups', 'sales', 'compost_batches', 'training_sessions'];

        for (const table of tables) {
            const res = await client.query(`SELECT COUNT(*) FROM ${table}`);
            console.log(`   - ${table}: ${res.rows[0].count} records`);
        }

        console.log('\n🎉 DATABASE SETUP COMPLETE! Please restart your backend server now.');

    } catch (error) {
        console.error('\n❌ Setup Failed:', error);
    } finally {
        client.release();
        pool.end();
    }
}

setupDatabase();
