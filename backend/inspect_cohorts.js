const pool = require('./src/config/database');

async function inspectTable() {
    try {
        console.log('--- COLUMNS ---');
        const cols = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'cohorts'
      ORDER BY ordinal_position
    `);
        console.table(cols.rows);

        console.log('\n--- CONSTRAINTS ---');
        const constraints = await pool.query(`
      SELECT conname, pg_get_constraintdef(c.oid)
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE conrelid = 'cohorts'::regclass
    `);
        console.table(constraints.rows);

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

inspectTable();
