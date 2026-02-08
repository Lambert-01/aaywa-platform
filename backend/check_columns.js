const db = require('./src/config/database');

async function checkSchema() {
    try {
        const res = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'training_sessions';
        `);
        console.log('Columns in training_sessions:', res.rows.map(r => r.column_name));
        process.exit(0);
    } catch (err) {
        console.error('Error checking schema:', err);
        process.exit(1);
    }
}

checkSchema();
