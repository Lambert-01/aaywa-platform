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

async function applySchemaDebug() {
    const logFile = path.join(__dirname, 'debug_schema_log.txt');
    let logContent = '';

    const log = (msg) => {
        // console.log(msg);
        logContent += msg + '\n';
        fs.writeFileSync(logFile, logContent); // Write incrementally
    };

    try {
        log('Connecting to database...');
        const client = await pool.connect();

        log('Reading schema file...');
        const schemaPath = path.join(__dirname, '..', '..', 'database', 'training_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Split by semicolon, but be careful about semicolons in strings or function bodies.
        // Standard SQL splitting is hard. 
        // Instead, let's try to just run it all and catch the specific error details.

        log('Applying FULL schema block...');
        try {
            await client.query(schemaSql);
            log('✅ Full schema applied successfully!');
        } catch (e) {
            log('❌ Error executing full schema block:');
            log(e.toString());
            if (e.position) {
                log(`Position: ${e.position}`);
                // Try to find context
                const contextStart = Math.max(0, parseInt(e.position) - 50);
                const contextEnd = Math.min(schemaSql.length, parseInt(e.position) + 50);
                log(`Context: ...${schemaSql.substring(contextStart, contextEnd)}...`);
            }
        }

        client.release();
        process.exit(0);
    } catch (err) {
        log('❌ Fatal Setup Error: ' + err.toString());
        process.exit(1);
    }
}

applySchemaDebug();
