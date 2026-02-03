const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function applySchema() {
    try {
        console.error('🔄 Applying Database Schema (via stderr)...');

        // CWD is likely backend/
        const schemaPath = './database/schema.sql';

        if (!fs.existsSync(schemaPath)) {
            console.error(`❌ Schema file not found at: ${schemaPath}`);
            console.error(`   CWD: ${process.cwd()}`);
            process.exit(1);
        }

        console.error(`📖 Reading schema from: ${schemaPath}`);
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.error('   Executing SQL query...');
        await pool.query(schemaSql);

        console.error('✅ Schema application successful! Tables created.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Schema application failed:', error);
        process.exit(1);
    }
}

applySchema();
