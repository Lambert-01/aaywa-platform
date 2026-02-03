const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('🚀 Script starting...');

// Try to load .env manually if dotenv fails
const envPath = path.resolve(__dirname, '../../.env');
console.log(`Checking for .env at: ${envPath}`);

if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log('✅ .env loaded');
} else {
    console.log('⚠️ .env not found at explicit path, trying default...');
    require('dotenv').config();
}

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

console.log(`Connecting to DB: ${process.env.DB_NAME} on ${process.env.DB_HOST}`);

async function checkData() {
    try {
        console.log('Checking VSLA Database Tables...');

        // Check vsla_groups
        const groups = await pool.query('SELECT COUNT(*) FROM vsla_groups');
        console.log(`✅ vsla_groups: ${groups.rows[0].count} records`);

        // Check vsla_members
        const members = await pool.query('SELECT COUNT(*) FROM vsla_members');
        console.log(`✅ vsla_members: ${members.rows[0].count} records`);

        // Check vsla_transactions
        const transactions = await pool.query('SELECT COUNT(*) FROM vsla_transactions');
        console.log(`✅ vsla_transactions: ${transactions.rows[0].count} records`);

    } catch (err) {
        console.error('❌ Database Check Failed:', err.message);
    } finally {
        pool.end();
    }
}

checkData();
