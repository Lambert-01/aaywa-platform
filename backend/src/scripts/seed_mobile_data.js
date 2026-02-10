const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const seedData = async () => {
    try {
        console.log('🌱 Starting database seed...');

        // 1. Create a Farmer
        console.log('Creating demo farmer...');
        const farmerRes = await pool.query(`
      INSERT INTO farmers (
        full_name, phone, gender, date_of_birth, 
        national_id, village_id, cohort_id, vsla_id,
        plot_size_hectares, crops, location_coordinates
      ) VALUES (
        'Jean Paul', '0780000001', 'Male', '1985-05-15',
        '1198580000000000', NULL, 1, 1,
        0.5, '["Avocado", "Coffee"]', '{"lat": -1.9441, "lng": 30.0619}'
      ) RETURNING id;
    `);
        const farmerId = farmerRes.rows[0]?.id || 1;

        // 2. Create VSLA Group if not exists
        console.log('Checking VSLA group...');
        await pool.query(`
      INSERT INTO vsla_groups (
        name, district, sector, meeting_day, 
        share_value, interest_rate
      ) VALUES (
        'Kigali Farmers Group', 'Kicukiro', 'Niboye', 'Friday',
        500, 5.0
      ) ON CONFLICT DO NOTHING;
    `);

        // 3. Create Sales
        console.log('Creating sales records...');
        await pool.query(`
      INSERT INTO sales (
        farmer_id, crop_type, quantity_kg, price_per_kg, 
        total_amount, sale_date, status, buyer_id
      ) VALUES 
      ($1, 'Avocado', 50.0, 2000.0, 100000.0, NOW() - INTERVAL '2 days', 'completed', 1),
      ($1, 'Coffee', 25.0, 3500.0, 87500.0, NOW() - INTERVAL '5 days', 'completed', 1),
      ($1, 'Beans', 10.0, 800.0, 8000.0, NOW() - INTERVAL '10 days', 'completed', 1)
    `, [farmerId]);

        // 4. Create VSLA Transactions
        console.log('Creating VSLA transactions...');
        await pool.query(`
      INSERT INTO vsla_transactions (
        vsla_id, member_id, transaction_type, amount, 
        transaction_date, description
      ) VALUES 
      (1, $1, 'saving', 5000, NOW() - INTERVAL '7 days', 'Weekly Validated'),
      (1, $1, 'loan_repayment', 2000, NOW() - INTERVAL '7 days', 'Loan Installment')
    `, [farmerId]);

        console.log('✅ Database seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seedData();
