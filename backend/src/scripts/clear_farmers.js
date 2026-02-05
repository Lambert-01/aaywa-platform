const pool = require('../config/database');

async function clearFarmers() {
    try {
        console.log('🗑️ Clearing all farmers data...');
        const query = 'TRUNCATE TABLE farmers RESTART IDENTITY CASCADE;';
        await pool.query(query);
        console.log('✅ All farmers data deleted successfully!');
    } catch (error) {
        console.error('❌ Error clearing farmers:', error);
    } finally {
        // End pool if needed, or just exit
        process.exit(0);
    }
}

clearFarmers();
