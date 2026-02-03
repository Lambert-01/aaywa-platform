require('dotenv').config();
const pool = require('../config/database');
const VSLA = require('../models/VSLA');

const seedVSLA = async () => {
    console.log('🌱 Seeding VSLA Groups...');

    try {
        // 1. Get existing cohorts
        const cohortsRes = await pool.query('SELECT id, name FROM cohorts LIMIT 4');
        const cohorts = cohortsRes.rows;

        if (cohorts.length === 0) {
            console.log('⚠️ No cohorts found. Please seed cohorts first.');
            return;
        }

        // 2. Create VSLA Groups for each cohort
        for (const cohort of cohorts) {
            console.log(`Processing VSLA for Cohort: ${cohort.name}`);

            // Check if exists
            const existing = await pool.query('SELECT * FROM vsla_groups WHERE cohort_id = $1', [cohort.id]);
            let vslaId = existing.rows[0]?.id;

            if (!vslaId) {
                const vsla = await VSLA.create({
                    cohort_id: cohort.id,
                    name: `VSLA-${cohort.name.replace(/\s+/g, '-')}`,
                    seed_capital: 300000 // Sample capital
                });
                vslaId = vsla.id;
                console.log(`  ✅ Created Group: ${vsla.name}`);
            }

            // 3. Add Members (Fetch farmers from this cohort)
            const farmers = await pool.query('SELECT id FROM farmers WHERE cohort_id = $1 LIMIT 25', [cohort.id]);

            if (farmers.rows.length === 0) {
                console.log(`  ⚠️ No farmers found in cohort ${cohort.name}`);
                continue;
            }

            const officers = ['chair', 'treasurer', 'secretary', 'loan_officer'];
            let officerIdx = 0;

            for (const farmer of farmers.rows) {
                const isMember = await pool.query('SELECT id FROM vsla_members WHERE vsla_id = $1 AND farmer_id = $2', [vslaId, farmer.id]);
                if (isMember.rows.length === 0) {
                    const role = officerIdx < 4 ? officers[officerIdx++] : 'member';
                    await VSLA.addMember({
                        vsla_id: vslaId,
                        farmer_id: farmer.id,
                        role: role,
                        opening_savings: 12000
                    });
                }
            }
            console.log(`  ✅ Synced ${farmers.rows.length} members.`);

            // 4. Seed Transactions
            const txnsCheck = await pool.query('SELECT count(*) FROM vsla_transactions WHERE vsla_id = $1', [vslaId]);
            if (parseInt(txnsCheck.rows[0].count) < 5) {
                // Seed some random transactions
                await VSLA.createTransaction({ vsla_id: vslaId, member_id: null, type: 'savings', amount: 300000, description: 'Initial seed capital' });

                // Random savings
                const memberIds = await pool.query('SELECT id FROM vsla_members WHERE vsla_id = $1', [vslaId]);
                for (let i = 0; i < 5; i++) {
                    const randomMember = memberIds.rows[Math.floor(Math.random() * memberIds.rows.length)].id;
                    await VSLA.createTransaction({
                        vsla_id: vslaId,
                        member_id: randomMember,
                        type: 'savings',
                        amount: 2000,
                        description: 'Weekly Saving'
                    });
                }
                console.log(`  ✅ Seeded transactions.`);
            }
        }

        console.log('✅ VSLA Seeding Complete.');

    } catch (error) {
        console.error('❌ VSLA Seeding Failed:', error);
    }
};

// Auto-run if called directly
if (require.main === module) {
    seedVSLA().then(() => process.exit());
}

module.exports = seedVSLA;
