const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'aaywa_user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'aaywa_platform',
    password: process.env.DB_PASSWORD || 'aaywa_secure_2026',
    port: process.env.DB_PORT || 5432,
});

// Helper function to generate random date
const randomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to generate random Rwandan name
const generateName = (index) => {
    const firstNames = [
        'Uwase', 'Mutoni', 'Ingabire', 'Mukamana', 'Uwineza',
        'Niyonsenga', 'Uwimana', 'Mukagasana', 'Ishimwe', 'Igiraneza',
        'Ntambara', 'Kamanzi', 'Mugisha', 'Nkurunziza', 'Habimana'
    ];
    const lastNames = [
        'Kayitesi', 'Muhoza', 'Iradukunda', 'Uwimbabazi', 'Niyonsenga',
        'Bizimana', 'Uwera', 'Mukobwa', 'Nsengiyumva', 'Byukusenge'
    ];
    return `${firstNames[index % firstNames.length]} ${lastNames[Math.floor(index / 2) % lastNames.length]}`;
};

async function seedDatabase() {
    console.log('🌱 Starting AAYWA Platform database seeding...\n');

    try {
        // ========================================
        // 1. SEED COHORTS
        // ========================================
        console.log('📋 Seeding Cohorts...');
        const cohorts = [
            { name: 'Cohort 1 - Avocado North', system: 'avocado' },
            { name: 'Cohort 2 - Avocado South', system: 'avocado' },
            { name: 'Cohort 3 - Macadamia East', system: 'macadamia' },
            { name: 'Cohort 4 - Macadamia West', system: 'macadamia' }
        ];

        const cohortIds = [];
        for (const cohort of cohorts) {
            const result = await pool.query(
                'INSERT INTO cohorts (name, cropping_system, status) VALUES ($1, $2, $3) RETURNING id',
                [cohort.name, cohort.system, 'active']
            );
            cohortIds.push(result.rows[0].id);
        }
        console.log(`✅ Created ${cohortIds.length} cohorts`);

        // ========================================
        // 2. SEED VSLA GROUPS
        // ========================================
        console.log('\n💰 Seeding VSLA Groups...');
        const vslaIds = [];
        for (let i = 0; i < cohortIds.length; i++) {
            const result = await pool.query(
                `INSERT INTO vsla_groups (cohort_id, name, seed_capital, total_savings, member_count)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                [cohortIds[i], `VSLA Group - Cohort ${i + 1}`, 12000, 0, 0]
            );
            vslaIds.push(result.rows[0].id);
        }
        console.log(`✅ Created ${vslaIds.length} VSLA groups (RWF 12,000 seed capital each)`);

        // ========================================
        // 3. SEED 100 FARMERS
        // ========================================
        console.log('\n👩‍🌾 Seeding 100 Farmers...');
        const householdTypes = ['teen_mother', 'female_headed', 'land_poor', 'champion', 'standard'];
        const genders = ['female', 'male'];
        const farmerIds = [];

        for (let i = 1; i <= 100; i++) {
            // Distribute 25 farmers per cohort
            const cohortIndex = Math.floor((i - 1) / 25);
            const cohortId = cohortIds[cohortIndex];
            const vslaId = vslaIds[cohortIndex];

            // Random household type with realistic distribution
            let householdType;
            if (i <= 20) householdType = 'teen_mother';      // 20%
            else if (i <= 45) householdType = 'female_headed'; // 25%
            else if (i <= 70) householdType = 'land_poor';     // 25%
            else if (i <= 80) householdType = 'champion';      // 10%
            else householdType = 'standard';                   // 20%

            const gender = householdType === 'teen_mother' || householdType === 'female_headed'
                ? 'female'
                : genders[Math.floor(Math.random() * genders.length)];

            const name = generateName(i);
            const dob = randomDate(new Date(1975, 0, 1), new Date(2006, 11, 31));
            const plotSize = (0.5 + Math.random() * 1.5).toFixed(2); // 0.5 to 2 hectares

            const result = await pool.query(
                `INSERT INTO farmers (cohort_id, vsla_id, full_name, date_of_birth, gender, household_type, plot_size_hectares, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                [cohortId, vslaId, name, dob, gender, householdType, plotSize, true]
            );
            farmerIds.push(result.rows[0].id);

            // Update VSLA member count
            await pool.query(
                'UPDATE vsla_groups SET member_count = member_count + 1 WHERE id = $1',
                [vslaId]
            );
        }
        console.log(`✅ Created 100 farmers distributed across 4 cohorts`);
        console.log(`   - 20 teen mothers`);
        console.log(`   - 25 female-headed households`);
        console.log(`   - 25 land-poor households`);
        console.log(`   - 10 champions`);
        console.log(`   - 20 standard households`);

        // ========================================
        // 4. SEED COMPOST BATCHES
        // ========================================
        console.log('\n♻️  Seeding Compost Batches...');
        const batchIds = [];
        for (let i = 1; i <= 12; i++) {
            const startDate = new Date(2024, i - 1, 1);
            const maturityDate = new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days later
            const qualityScore = 70 + Math.floor(Math.random() * 30);
            const kgProduced = 400 + Math.floor(Math.random() * 600);
            const status = i <= 10 ? 'completed' : 'in_progress';

            const result = await pool.query(
                `INSERT INTO compost_batches (batch_number, quality_score, kg_produced, start_date, maturity_date, status)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                [`BATCH-2024-${String(i).padStart(3, '0')}`, qualityScore, kgProduced, startDate, maturityDate, status]
            );
            batchIds.push(result.rows[0].id);
        }
        console.log(`✅ Created ${batchIds.length} compost batches`);

        // ========================================
        // 5. SEED COMPOST WORKDAYS
        // ========================================
        console.log('\n🗓️  Seeding Compost Workdays...');
        let totalWorkdays = 0;
        // For each completed batch, assign random farmers
        for (const batchId of batchIds.slice(0, 10)) {
            const workerCount = 10 + Math.floor(Math.random() * 15); // 10-25 workers per batch
            const selectedFarmers = [];

            // Randomly select farmers
            while (selectedFarmers.length < workerCount) {
                const randomFarmerId = farmerIds[Math.floor(Math.random() * farmerIds.length)];
                if (!selectedFarmers.includes(randomFarmerId)) {
                    selectedFarmers.push(randomFarmerId);
                }
            }

            // Assign workdays
            for (const farmerId of selectedFarmers) {
                const workdays = 3 + Math.floor(Math.random() * 5); // 3-7 days per farmer
                for (let day = 0; day < workdays; day++) {
                    const workDate = randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31));
                    await pool.query(
                        `INSERT INTO compost_workdays (farmer_id, batch_id, workday_date, stipend_amount, payment_status)
             VALUES ($1, $2, $3, $4, $5)`,
                        [farmerId, batchId, workDate, 3000, 'paid']
                    );
                    totalWorkdays++;
                }
            }
        }
        console.log(`✅ Created ${totalWorkdays} compost workday records (RWF 3,000/day stipend)`);

        // ========================================
        // 6. SEED TRAINING SESSIONS
        // ========================================
        console.log('\n🎓 Seeding Training Sessions...');
        const topics = [
            'Coffee Pruning Techniques',
            'Pest and Disease Management',
            'Soil Health and Composting',
            'Harvest Best Practices',
            'Post-Harvest Processing',
            'Climate-Smart Agriculture',
            'Financial Literacy (VSLA)',
            'Gender and Leadership'
        ];

        for (let i = 1; i <= 30; i++) {
            const cohortId = cohortIds[i % 4];
            const topic = topics[i % topics.length];
            const scheduleDate = randomDate(new Date(2024, 0, 1), new Date(2025, 11, 31));
            const attendance = 15 + Math.floor(Math.random() * 15); // 15-30 attendees
            const status = scheduleDate < new Date() ? 'completed' : 'scheduled';

            await pool.query(
                `INSERT INTO training_sessions (title, cohort_id, topic, scheduled_date, attendance_count, status, duration_hours)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [`${topic} - Cohort ${cohortId}`, cohortId, topic, scheduleDate, attendance, status, 2]
            );
        }
        console.log(`✅ Created 30 training sessions`);

        // ========================================
        // 7. SEED SALES DATA
        // ========================================
        console.log('\n💵 Seeding Sales Records...');
        const cropTypes = ['avocado', 'macadamia', 'compost'];

        for (let i = 0; i < 50; i++) {
            const farmerId = farmerIds[Math.floor(Math.random() * farmerIds.length)];
            const cropType = cropTypes[Math.floor(Math.random() * cropTypes.length)];
            const quantityKg = 50 + Math.floor(Math.random() * 200);
            const grossRevenue = quantityKg * (500 + Math.random() * 1000); // RWF 500-1500 per kg
            const inputCost = grossRevenue * (0.1 + Math.random() * 0.2); // 10-30% input cost
            const netRevenue = grossRevenue - inputCost;
            const farmerShare = netRevenue * 0.7; // 70%
            const sanzaShare = netRevenue * 0.3;  // 30%

            await pool.query(
                `INSERT INTO sales (farmer_id, crop_type, quantity_kg, gross_revenue, input_cost, net_revenue, farmer_share, sanza_share, sale_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [farmerId, cropType, quantityKg, grossRevenue, inputCost, netRevenue, farmerShare, sanzaShare, randomDate(new Date(2024, 0, 1), new Date())]
            );
        }
        console.log(`✅ Created 50 sales records with 70-30 profit sharing`);

        // ========================================
        // 8. VERIFY COUNTS
        // ========================================
        console.log('\n📊 Verification:');
        const cohortCount = await pool.query('SELECT COUNT(*) FROM cohorts');
        const vslaCount = await pool.query('SELECT COUNT(*) FROM vsla_groups');
        const farmerCount = await pool.query('SELECT COUNT(*) FROM farmers');
        const batchCount = await pool.query('SELECT COUNT(*) FROM compost_batches');
        const workdayCount = await pool.query('SELECT COUNT(*) FROM compost_workdays');
        const trainingCount = await pool.query('SELECT COUNT(*) FROM training_sessions');
        const salesCount = await pool.query('SELECT COUNT(*) FROM sales');

        console.log(`   Cohorts: ${cohortCount.rows[0].count}`);
        console.log(`   VSLA Groups: ${vslaCount.rows[0].count}`);
        console.log(`   Farmers: ${farmerCount.rows[0].count}`);
        console.log(`   Compost Batches: ${batchCount.rows[0].count}`);
        console.log(`   Workdays: ${workdayCount.rows[0].count}`);
        console.log(`   Training Sessions: ${trainingCount.rows[0].count}`);
        console.log(`   Sales: ${salesCount.rows[0].count}`);

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\nYou can now login and navigate to the dashboard to see real data.');

    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        console.error(error.stack);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run the seeding
seedDatabase();
