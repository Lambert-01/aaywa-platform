const { Pool } = require('pg');
require('dotenv').config();

// Direct connection to execute migration using .env credentials
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'aaywa_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
});

async function createAlertsTable() {
    const client = await pool.connect();

    try {
        console.log('Creating alerts table...');

        // Create table
        await client.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        alert_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'warning', 'info', 'success')),
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        action_url VARCHAR(200),
        entity_type VARCHAR(50),
        entity_id INTEGER,
        entity_name VARCHAR(200),
        triggered_by VARCHAR(100),
        threshold_value DECIMAL(10,2),
        actual_value DECIMAL(10,2),
        dismissed BOOLEAN DEFAULT false,
        dismissed_at TIMESTAMP,
        dismissed_by INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

        console.log('✅ Alerts table created');

        // Create indexes
        await client.query('CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);');
        await client.query('CREATE INDEX IF NOT EXISTS idx_alerts_entity ON alerts(entity_type, entity_id);');
        await client.query('CREATE INDEX IF NOT EXISTS idx_alerts_dismissed ON alerts(dismissed);');
        await client.query('CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at DESC);');

        console.log('✅ Indexes created');

        // Test query
        const result = await client.query('SELECT COUNT(*) FROM alerts');
        console.log(`✅ Verified: alerts table has ${result.rows[0].count} rows`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

createAlertsTable()
    .then(() => {
        console.log('\n🎉 Migration complete!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('\n💥 Migration failed:', err);
        process.exit(1);
    });
