const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'aaywa_user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'aaywa_platform',
    password: process.env.DB_PASSWORD || 'aaywa_secure_2026',
    port: process.env.DB_PORT || 5432,
});

async function verify() {
    try {
        const res = await pool.query('SELECT count(*) FROM farmers');
        console.log('Farmer count:', res.rows[0].count);

        const cohorts = await pool.query('SELECT count(*) FROM cohorts');
        console.log('Cohort count:', cohorts.rows[0].count);
    } catch (err) {
        console.error('Verification failed:', err);
        process.exit(1);
    } finally {
        pool.end();
    }
}

verify();
