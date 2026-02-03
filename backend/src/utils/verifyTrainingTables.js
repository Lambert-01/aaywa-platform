const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function verifyTables() {
    const logFile = path.join(__dirname, 'verification_log.txt');
    let logContent = '';

    const log = (msg) => {
        console.log(msg);
        logContent += msg + '\n';
    };

    try {
        const client = await pool.connect();

        const tablesToCheck = [
            'training_sessions',
            'training_attendance',
            'quizzes',
            'quiz_questions',
            'quiz_results',
            'learning_materials',
            'champions',
            'training_session_summary', // view
            'participant_training_stats' // view
        ];

        log('Verifying tables and views...');

        for (const table of tablesToCheck) {
            const res = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `, [table]);

            const exists = res.rows[0].exists;
            log(`${exists ? '✅' : '❌'} ${table}: ${exists ? 'Exists' : 'MISSING'}`);
        }

        client.release();
        fs.writeFileSync(logFile, logContent);
        process.exit(0);
    } catch (err) {
        log('Error verifying tables: ' + err.toString());
        fs.writeFileSync(logFile, logContent);
        process.exit(1);
    }
}

verifyTables();
