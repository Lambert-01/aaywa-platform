const pool = require('../config/database');

const createFarmerIssuesTable = async () => {
    const client = await pool.connect();
    try {
        console.log('Creating farmer_issues table...');

        await client.query(`
      CREATE TABLE IF NOT EXISTS farmer_issues (
        id SERIAL PRIMARY KEY,
        farmer_id VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        urgency VARCHAR(20) NOT NULL DEFAULT 'Medium',
        status VARCHAR(20) NOT NULL DEFAULT 'Open',
        gps_lat DECIMAL(10, 8),
        gps_lng DECIMAL(11, 8),
        photo_url TEXT,
        assigned_to VARCHAR(255),
        resolution_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log('✅ farmer_issues table created successfully.');
    } catch (err) {
        console.error('❌ Error creating table:', err);
    } finally {
        client.release();
        pool.end();
    }
};

createFarmerIssuesTable();
