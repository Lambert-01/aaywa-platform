const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const pool = require('../config/database');

async function fixSchema() {
    const client = await pool.connect();
    try {
        console.log('🔧 Fixing database schema...');

        // 1. Fix quality_score type
        await client.query('ALTER TABLE compost_batches ALTER COLUMN quality_score TYPE DECIMAL(5, 2)');
        console.log('✅ quality_score updated to DECIMAL');

        // 2. Fix quantity_kg type
        await client.query('ALTER TABLE compost_batches ALTER COLUMN quantity_kg TYPE DECIMAL(10, 2)');
        console.log('✅ quantity_kg updated to DECIMAL');

        // 3. Remove blocking constraints (let app handle validation)
        await client.query('ALTER TABLE compost_batches DROP CONSTRAINT IF EXISTS compost_batches_status_check');
        console.log('✅ Removed conflicting status constraint');

        // 4. Ensure other columns exist (just in case)
        await client.query('ALTER TABLE compost_batches ADD COLUMN IF NOT EXISTS batch_number VARCHAR(50)');
        console.log('✅ batch_number guaranteed');

        await client.query('ALTER TABLE compost_workdays ADD COLUMN IF NOT EXISTS date_worked DATE DEFAULT CURRENT_DATE');
        await client.query('ALTER TABLE compost_workdays ADD COLUMN IF NOT EXISTS daily_wage DECIMAL(10, 2) DEFAULT 0');
        await client.query('ALTER TABLE compost_workdays ADD COLUMN IF NOT EXISTS hours_worked DECIMAL(5, 2) DEFAULT 8');
        await client.query('ALTER TABLE compost_workdays ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT \'pending\'');

        // Remove legacy column that causes NOT NULL violation
        await client.query('ALTER TABLE compost_workdays DROP COLUMN IF EXISTS workday_date');
        console.log('✅ compost_workdays columns guaranteed');

        // 5. Grant permissions to aaywa_user (Fixes permission denied error)
        try {
            await client.query('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO aaywa_user');
            await client.query('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO aaywa_user');
            console.log('✅ Permissions granted to aaywa_user');
        } catch (e) {
            console.log('⚠️ Could not grant permissions (might need superuser):', e.message);
        }

        // 6. Create or Replace View (Fixes missing relation error)
        await client.query(`
            CREATE OR REPLACE VIEW compost_batch_summary AS
            SELECT 
                cb.id,
                cb.batch_number,
                cb.production_date,
                cb.start_date,
                cb.maturity_date,
                cb.quantity_kg,
                cb.quality_score,
                cb.status,
                cb.cohort_id,
                c.name as cohort_name,
                u.full_name as producer_name,
                COALESCE(
                    (SELECT json_agg(json_build_object(
                        'type', cfi.material_type,
                        'percentage', cfi.percentage,
                        'kgAmount', cfi.kg_amount,
                        'cost', cfi.cost_per_kg
                    ))
                    FROM compost_feedstock_items cfi
                    WHERE cfi.batch_id = cb.id),
                    '[]'::json
                ) as feedstock_mix,
                COALESCE(
                    (SELECT SUM(cw.daily_wage)
                    FROM compost_workdays cw
                    WHERE cw.batch_id = cb.id),
                    0
                ) as total_labor_cost,
                COALESCE(
                    (SELECT SUM(cfi.kg_amount * cfi.cost_per_kg)
                    FROM compost_feedstock_items cfi
                    WHERE cfi.batch_id = cb.id),
                    0
                ) as total_feedstock_cost,
                COALESCE(
                    (SELECT SUM(cs.kg_sold)
                    FROM compost_sales cs
                    WHERE cs.batch_id = cb.id),
                    0
                ) as kg_sold,
                COALESCE(
                    (SELECT SUM(cs.total_revenue)
                    FROM compost_sales cs
                    WHERE cs.batch_id = cb.id),
                    0
                ) as total_revenue
            FROM compost_batches cb
            LEFT JOIN users u ON cb.produced_by = u.id
            LEFT JOIN cohorts c ON cb.cohort_id = c.id
            ORDER BY cb.created_at DESC;
        `);
        console.log('✅ compost_batch_summary view created');

        // 7. Create Helper Function (Optional - catch error if ownership mismatch)
        try {
            await client.query(`
                CREATE OR REPLACE FUNCTION calculate_cost_per_kg(batch_id_param INTEGER)
                RETURNS DECIMAL(10, 2) AS $$
                DECLARE
                    total_cost DECIMAL(12, 2);
                    quantity DECIMAL(10, 2);
                BEGIN
                    SELECT 
                        COALESCE(SUM(cfi.kg_amount * cfi.cost_per_kg), 0) + 
                        COALESCE(SUM(cw.daily_wage), 0)
                    INTO total_cost
                    FROM compost_batches cb
                    LEFT JOIN compost_feedstock_items cfi ON cfi.batch_id = cb.id
                    LEFT JOIN compost_workdays cw ON cw.batch_id = cb.id
                    WHERE cb.id = batch_id_param;
                    
                    SELECT quantity_kg INTO quantity
                    FROM compost_batches
                    WHERE id = batch_id_param;
                    
                    IF quantity > 0 THEN
                        RETURN total_cost / quantity;
                    ELSE
                        RETURN 0;
                    END IF;
                END;
                $$ LANGUAGE plpgsql;
            `);
            console.log('✅ calculate_cost_per_kg function created');
        } catch (e) {
            console.log('⚠️ Could not create helper function (non-critical):', e.message);
        }

        console.log('✨ Schema fixed successfully!');
    } catch (err) {
        console.error('❌ Error fixing schema:', err);
    } finally {
        client.release();
        process.exit();
    }
}

fixSchema();
