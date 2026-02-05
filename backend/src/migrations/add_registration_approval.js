const pool = require('../config/database');

/**
 * Migration: Add Registration Approval Fields
 * Adds columns to support user registration approval workflow
 */

async function up() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('Adding registration approval columns...');

        // Add registration_status column
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS registration_status VARCHAR(20) DEFAULT 'approved'
            CHECK (registration_status IN ('pending', 'approved', 'rejected'))
        `);

        // Add registration_notes column for admin notes
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS registration_notes TEXT
        `);

        // Add requested_role column for initial role request
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS requested_role VARCHAR(50)
        `);

        // Add registration_date for tracking
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `);

        // Add approved_by column to track who approved
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES users(id)
        `);

        // Add approved_at timestamp
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP
        `);

        // Set all existing users to 'approved' status
        await client.query(`
            UPDATE users 
            SET registration_status = 'approved',
                registration_date = created_at,
                approved_at = created_at
            WHERE registration_status IS NULL OR registration_status = 'approved'
        `);

        // Create index for faster queries on pending registrations
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_users_registration_status 
            ON users(registration_status)
        `);

        await client.query('COMMIT');
        console.log('✅ Migration completed successfully!');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function down() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('Reverting registration approval columns...');

        await client.query('DROP INDEX IF EXISTS idx_users_registration_status');
        await client.query('ALTER TABLE users DROP COLUMN IF EXISTS approved_at');
        await client.query('ALTER TABLE users DROP COLUMN IF EXISTS approved_by');
        await client.query('ALTER TABLE users DROP COLUMN IF EXISTS registration_date');
        await client.query('ALTER TABLE users DROP COLUMN IF EXISTS requested_role');
        await client.query('ALTER TABLE users DROP COLUMN IF EXISTS registration_notes');
        await client.query('ALTER TABLE users DROP COLUMN IF EXISTS registration_status');

        await client.query('COMMIT');
        console.log('✅ Migration reverted successfully!');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Revert failed:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run migration if called directly
if (require.main === module) {
    up()
        .then(() => {
            console.log('Migration complete');
            process.exit(0);
        })
        .catch((err) => {
            console.error('Migration failed:', err);
            process.exit(1);
        });
}

module.exports = { up, down };
