const bcrypt = require('bcryptjs');
const db = require('./src/config/database');

async function createFarmerUser() {
  try {
    console.log('🌾 Creating test farmer user account...\n');

    // Hash the password
    const password = 'farmer123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start transaction
    await db.query('BEGIN');

    // Create or update user
    const userResult = await db.query(`
      INSERT INTO users (full_name, email, password_hash, role, phone, language, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      ON CONFLICT (email) 
      DO UPDATE SET 
        password_hash = EXCLUDED.password_hash,
        updated_at = NOW()
      RETURNING id, email, role
    `, [
      'Jean Claude Mugabo',
      'farmer@aaywa.rw',
      hashedPassword,
      'farmer',
      '+250788123456',
      'en'
    ]);

    const userId = userResult.rows[0].id;
    console.log('✅ User created/updated:', userResult.rows[0]);

    // Link to existing farmer or create new one
    const existingFarmer = await db.query(`
      SELECT id FROM farmers WHERE user_id = $1 OR user_id IS NULL LIMIT 1
    `, [userId]);

    let farmerId;

    if (existingFarmer.rows.length > 0) {
      // Link existing farmer to user
      farmerId = existingFarmer.rows[0].id;
      await db.query(`
        UPDATE farmers 
        SET user_id = $1, trust_score = 75, full_name = $2, phone = $3
        WHERE id = $4
      `, [userId, 'Jean Claude Mugabo', '+250788123456', farmerId]);
      console.log(`✅ Updated farmer (ID: ${farmerId}) and linked to user`);
    } else {
      // Create new farmer (using actual schema columns)
      const farmerResult = await db.query(`
        INSERT INTO farmers (
          cohort_id, full_name, phone, gender, date_of_birth, 
          household_type, user_id, trust_score, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
        ) RETURNING id
      `, [
        1, // cohort_id
        'Jean Claude Mugabo',
        '+250788123456',
        'male',
        '1990-05-15',
        'normal',
        userId,
        75
      ]);

      farmerId = farmerResult.rows[0].id;
      console.log(`✅ Created new farmer (ID: ${farmerId})`);
    }

    // Commit transaction
    await db.query('COMMIT');

    // Verify creation
    const verification = await db.query(`
      SELECT 
        u.id as user_id,
        u.email,
        u.role,
        f.id as farmer_id,
        f.full_name,
        f.phone,
        f.trust_score
      FROM users u
      LEFT JOIN farmers f ON f.user_id = u.id
      WHERE u.email = 'farmer@aaywa.rw'
    `);

    console.log('\n✅ Farmer user account ready!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:          farmer@aaywa.rw');
    console.log('Password:       farmer123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('User ID:       ', verification.rows[0].user_id);
    console.log('Farmer ID:     ', verification.rows[0].farmer_id);
    console.log('Full Name:     ', verification.rows[0].full_name);
    console.log('Phone:         ', verification.rows[0].phone);
    console.log('Trust Score:   ', verification.rows[0].trust_score);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 You can now login to the mobile app!\n');

    process.exit(0);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createFarmerUser();
