const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Manually parse .env if dotenv fails
const envPath = path.join(__dirname, '.env');
const envConfig = fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .reduce((acc, line) => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts[1].trim();
            acc[key] = value;
        }
        return acc;
    }, {});

const pool = new Pool({
    user: envConfig.DB_USER,
    host: envConfig.DB_HOST,
    database: envConfig.DB_NAME,
    password: envConfig.DB_PASSWORD,
    port: envConfig.DB_PORT,
});

async function checkRoles() {
    try {
        const res = await pool.query('SELECT id, full_name, email, role FROM users');
        console.log('JSON_START');
        console.log(JSON.stringify(res.rows, null, 2));
        console.log('JSON_END');

        const distinctRoles = await pool.query('SELECT DISTINCT role FROM users');
        console.log('ROLES_START');
        console.log(JSON.stringify(distinctRoles.rows, null, 2));
        console.log('ROLES_END');

        await pool.end();
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
}

checkRoles();
