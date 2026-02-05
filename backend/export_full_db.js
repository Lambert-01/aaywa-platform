const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'aaywa_platform',
    user: process.env.DB_USER || 'aaywa_user',
    password: process.env.DB_PASSWORD || 'aaywa_secure_2026',
});

async function exportDatabase() {
    const client = await pool.connect();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `aaywa_full_export_${timestamp}.sql`;
    const outputPath = path.join(__dirname, filename);

    const stream = fs.createWriteStream(outputPath, { flags: 'a' });

    try {
        console.log('📦 Starting database export...');

        // Write Header
        stream.write(`-- AAYWA Platform Database Export\n`);
        stream.write(`-- Generated: ${new Date().toISOString()}\n`);
        stream.write(`-- Database: ${process.env.DB_NAME || 'aaywa_platform'}\n\n`);

        // Get all tables
        const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
        const tablesRes = await client.query(tablesQuery);
        const tables = tablesRes.rows.map(row => row.table_name);

        console.log(`Found ${tables.length} tables to export.`);

        for (const table of tables) {
            console.log(`Exporting table: ${table}...`);

            // 1. Structure
            stream.write(`\n-- Structure for table ${table} --\n`);
            stream.write(`DROP TABLE IF EXISTS "${table}" CASCADE;\n`);

            // Get column info
            const columnsQuery = `
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
      `;
            const columnsRes = await client.query(columnsQuery, [table]);

            let createTableSync = `CREATE TABLE "${table}" (\n`;
            const colDefs = columnsRes.rows.map(col => {
                let def = `  "${col.column_name}" ${col.data_type}`;
                if (col.is_nullable === 'NO') def += ' NOT NULL';
                if (col.column_default) def += ` DEFAULT ${col.column_default}`;
                return def;
            });
            createTableSync += colDefs.join(',\n');
            createTableSync += '\n);\n';

            stream.write(createTableSync);

            // 2. Data
            stream.write(`\n-- Data for table ${table} --\n`);
            const dataRes = await client.query(`SELECT * FROM "${table}"`);

            if (dataRes.rows.length > 0) {
                for (const row of dataRes.rows) {
                    const columns = Object.keys(row).map(c => `"${c}"`).join(', ');
                    const values = Object.values(row).map(val => {
                        if (val === null) return 'NULL';
                        if (typeof val === 'number') return val;
                        if (val instanceof Date) return `'${val.toISOString()}'`;
                        if (typeof val === 'object') return `'${JSON.stringify(val)}'`;
                        // Escape single quotes
                        return `'${String(val).replace(/'/g, "''")}'`;
                    }).join(', ');

                    stream.write(`INSERT INTO "${table}" (${columns}) VALUES (${values});\n`);
                }
            } else {
                stream.write(`-- No data --\n`);
            }

            stream.write(`\n`);
        }

        console.log(`\n✅ Export completed successfully!`);
        console.log(`File saved to: ${outputPath}`);

    } catch (err) {
        console.error('Export failed:', err);
    } finally {
        stream.end();
        client.release();
        pool.end();
    }
}

exportDatabase();
