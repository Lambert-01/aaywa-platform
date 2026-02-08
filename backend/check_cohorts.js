const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = require('./src/config/database');

async function checkCohorts() {
    let log = '';
    try {
        log += 'Connecting...\n';
        const client = await pool.connect();

        log += 'Checking cohorts structure...\n';
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'cohorts';
        `);
        log += `Columns: ${JSON.stringify(res.rows.map(c => `${c.column_name} (${c.data_type})`))}\n`;

        const sample = await client.query(`SELECT boundary_coordinates FROM cohorts LIMIT 1`);
        if (sample.rows.length > 0) {
            log += `Sample boundary: ${JSON.stringify(sample.rows[0])}\n`;
        } else {
            log += 'No cohort data found.\n';
        }

        client.release();
    } catch (err) {
        log += `Error: ${err.message}\n`;
    } finally {
        await pool.end();
        fs.writeFileSync('cohorts_log.txt', log);
    }
}

checkCohorts();
