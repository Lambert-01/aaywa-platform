const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const logFile = path.join(__dirname, 'db_debug.log');

function log(msg) {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${msg}\n`;
    console.log(msg);
    fs.appendFileSync(logFile, line);
}

const pool = new Pool({
    user: process.env.DB_USER || 'aaywa_user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'aaywa_platform',
    password: process.env.DB_PASSWORD || 'aaywa_secure_2026',
    port: process.env.DB_PORT || 5432,
});

async function seed() {
    try {
        log('Starting database seed...');

        // Check connection
        const client = await pool.connect();
        log('Connected to database successfully.');

        // Hardcoded SQL to ensure no file read errors
        const sql = `
      DROP TABLE IF EXISTS users CASCADE;

      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        language VARCHAR(10) DEFAULT 'en',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP
      );

      INSERT INTO users (full_name, email, password_hash, role, language, is_active) 
      VALUES 
      ('System Admin', 'admin@aaywa.rw', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIw8YJHztC', 'project_manager', 'en', true);
    `;

        log('Executing SQL...');
        await client.query(sql);
        log('SQL Executed successfully.');

        const res = await client.query('SELECT count(*) FROM users');
        log(`User count after seed: ${res.rows[0].count}`);
        client.release();

        log('✅ Database setup COMPLETE. You can login now.');
    } catch (err) {
        log(`❌ ERROR: ${err.message}`);
        log(JSON.stringify(err, null, 2));
    } finally {
        await pool.end();
    }
}

seed();
