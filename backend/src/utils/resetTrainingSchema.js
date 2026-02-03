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

async function resetSchema() {
    const logFile = path.join(process.cwd(), 'reset_log.txt');
    const log = (msg) => {
        // console.log(msg); // Output swallowed in this env
        fs.appendFileSync(logFile, msg + '\n');
    };
    fs.writeFileSync(logFile, '');

    try {
        log('Connecting to database...');
        const client = await pool.connect();

        // 1. Drop existing objects
        log('Dropping existing training objects...');
        const dropQueries = [
            'DROP VIEW IF EXISTS training_session_summary CASCADE',
            'DROP VIEW IF EXISTS participant_training_stats CASCADE',
            'DROP TABLE IF EXISTS training_attendance CASCADE',
            'DROP TABLE IF EXISTS quiz_results CASCADE',
            'DROP TABLE IF EXISTS quiz_questions CASCADE',
            'DROP TABLE IF EXISTS quizzes CASCADE',
            'DROP TABLE IF EXISTS learning_materials CASCADE',
            'DROP TABLE IF EXISTS champions CASCADE',
            'DROP TABLE IF EXISTS training_sessions CASCADE'
        ];

        for (const query of dropQueries) {
            log(`Executing: ${query}`);
            await client.query(query);
        }

        // 2. Read Schema
        const schemaPath = path.join(process.cwd(), '..', 'database', 'training_schema.sql');
        log(`Reading schema from: ${schemaPath}`);
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found at ${schemaPath}`);
        }
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // 3. Apply Schema
        log('Applying fresh schema...');
        await client.query(schemaSql);
        log('✅ Schema applied successfully!');

        client.release();
        process.exit(0);
    } catch (err) {
        log('❌ Error resetting schema: ' + err.toString());
        process.exit(1);
    }
}

resetSchema();
