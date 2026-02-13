const pool = require('./src/config/database');

async function migrate() {
    console.log('--- User Table Registration Migration ---');
    try {
        // Check for role constraint if it exists (it might be a PG check constraint)
        // For simplicity, we'll just try to add the columns first

        const columns = [
            { name: 'registration_status', type: "VARCHAR(20) DEFAULT 'approved'" },
            { name: 'requested_role', type: 'VARCHAR(50)' },
            { name: 'registration_notes', type: 'TEXT' },
            { name: 'registration_date', type: 'TIMESTAMP' },
            { name: 'approved_by', type: 'INTEGER REFERENCES users(id)' },
            { name: 'approved_at', type: 'TIMESTAMP' }
        ];

        for (const col of columns) {
            try {
                // Check if column exists
                const checkRes = await pool.query(`
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = $1
                `, [col.name]);

                if (checkRes.rows.length === 0) {
                    console.log(`Adding column ${col.name}...`);
                    await pool.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
                    console.log(`Column ${col.name} added.`);
                } else {
                    console.log(`Column ${col.name} already exists.`);
                }
            } catch (err) {
                console.error(`Error adding column ${col.name}:`, err.message);
            }
        }

        // Update default for registration_status - if it was already there, ensure it has a default
        await pool.query("ALTER TABLE users ALTER COLUMN registration_status SET DEFAULT 'approved'");

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
