const fs = require('fs');

try {
    console.log('1. Script started');

    console.log('2. Requiring path...');
    const path = require('path');
    console.log('3. Path required.');

    console.log('4. Requiring dotenv...');
    const dotenv = require('dotenv');
    console.log('5. Dotenv required. Configuring...');
    const result = dotenv.config();
    if (result.error) {
        console.log('⚠️ Dotenv config error:', result.error.message);
    } else {
        console.log('6. Dotenv configured.');
    }

    console.log('7. Requiring pg...');
    const { Pool } = require('pg');
    console.log('8. pg required.');

    console.log('9. Creating Pool...');
    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });
    console.log('10. Pool created.');

    console.log('11. Attempting connection...');
    pool.connect().then(client => {
        console.log('✅ Connected to database!');
        client.release();
        pool.end();
        console.log('12. Connection closed. Success.');
    }).catch(err => {
        console.error('❌ Connection failed:', err.message);
        pool.end();
    });

} catch (e) {
    console.error('🔥 CRASHED:', e.message);
}
