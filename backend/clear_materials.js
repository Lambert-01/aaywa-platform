const pool = require('./src/config/database');
async function run() {
    try {
        await pool.query('TRUNCATE learning_materials CASCADE');
        console.log('MATERIALS_CLEARED_SUCCESS');
    } catch (e) {
        console.error('CLEANUP_ERROR:' + e.message);
    } finally {
        process.exit();
    }
}
run();
