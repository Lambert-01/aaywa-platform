const fs = require('fs');
const path = require('path');
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
    // CWD is 'backend/'
    const logFile = path.join(process.cwd(), 'schema_apply_log.txt');

    const log = (msg) => {
        // console.log(msg);
        fs.appendFileSync(logFile, msg + '\n');
    };
    fs.writeFileSync(logFile, ''); // Clear log

    try {
        log(`CWD: ${process.cwd()}`);
        log('Connecting to database...');
        const client = await pool.connect();

        // Schema is in ../database/training_schema.sql relative to backend/
        const schemaPath = path.join(process.cwd(), '..', 'database', 'training_schema.sql');
        log(`Reading schema file from: ${schemaPath}`);

        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found at ${schemaPath}`);
        }

        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        log('Applying schema...');
        await client.query(schemaSql);

        log('✅ Schema applied successfully!');
        client.release();
        process.exit(0);
    } catch (err) {
        log('❌ Error applying schema: ' + err.toString());
        process.exit(1);
    }
}

applySchema();
