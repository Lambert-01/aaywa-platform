const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function checkRoles() {
    try {
        const res = await pool.query('SELECT id, full_name, email, role FROM users');
        console.log('--- USERS AND ROLES ---');
        console.table(res.rows);

        const distinctRoles = await pool.query('SELECT DISTINCT role FROM users');
        console.log('\n--- DISTINCT ROLES ---');
        console.table(distinctRoles.rows);

        await pool.end();
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
}

checkRoles();
