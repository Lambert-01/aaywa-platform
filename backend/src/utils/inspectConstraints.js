const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const pool = require('../config/database');

async function inspectConstraints() {
    const client = await pool.connect();
    try {
        console.log('🔍 Inspecting constraint "compost_batches_status_check"...');

        const result = await client.query(`
            SELECT pg_get_constraintdef(oid) AS constraint_def
            FROM pg_constraint
            WHERE conname = 'compost_batches_status_check';
        `);

        if (result.rows.length > 0) {
            console.log('📜 Constraint Definition:', result.rows[0].constraint_def);
        } else {
            console.log('❌ Constraint not found (or name is different). listing all check constraints on compost_batches:');
            const all constraints = await client.query(`
                SELECT conname, pg_get_constraintdef(oid) 
                FROM pg_constraint 
                WHERE conrelid = 'compost_batches'::regclass AND contype = 'c';
            `);
            console.log(all_constraints.rows);
        }

    } catch (err) {
        console.error('❌ Error inspecting constraints:', err);
    } finally {
        client.release();
        process.exit();
    }
}

inspectConstraints();
