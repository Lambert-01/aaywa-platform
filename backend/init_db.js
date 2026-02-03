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

async function initDb() {
    try {
        console.log('🔄 Initializing database schema...');

        const schemaPath = path.join(__dirname, 'database_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        await pool.query(schemaSql);

        console.log('✅ Database schema applied successfully');

    } catch (error) {
        console.error('❌ Failed to initialize database:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

initDb();
