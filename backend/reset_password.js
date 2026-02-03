const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'aaywa_user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'aaywa_platform',
    password: process.env.DB_PASSWORD || 'aaywa_secure_2026',
    port: process.env.DB_PORT || 5432,
});

async function resetPassword() {
    try {
        const email = 'admin@aaywa.rw';
        const newPassword = 'AdminPass123!';

        console.log(`Generating new hash for password: ${newPassword}`);
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(newPassword, salt);

        console.log('Updating database...');
        const res = await pool.query(
            'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email',
            [hash, email]
        );

        if (res.rowCount === 0) {
            console.log('❌ User not found! Did the seed script run?');
        } else {
            console.log('✅ Password updated successfully!');
            console.log(`User: ${res.rows[0].email}`);
            console.log(`New Password: ${newPassword}`);
        }
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await pool.end();
    }
}

resetPassword();
