const pool = require('./src/config/database');

async function check() {
    try {
        console.log('Checking users table columns...');
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        console.log('Columns found:');
        res.rows.forEach(row => {
            console.log(` - ${row.column_name}: ${row.data_type}`);
        });
        process.exit(0);
    } catch (err) {
        console.error('Check failed:', err);
        process.exit(1);
    }
}

check();
