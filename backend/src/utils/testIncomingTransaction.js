const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'aaywa_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
});

async function testIncomingTransaction() {
    try {
        console.log('📝 Testing incoming transaction...\n');

        // Test data
        const testData = {
            facilityId: 1,
            cropType: 'avocado',
            quantityKg: 50,
            qualityGrade: 'A',
            farmerId: null,
            temperature: 8,
            notes: 'Test transaction'
        };

        console.log('Test data:', testData);

        // Check facility
        const facilityCheck = await pool.query(
            'SELECT capacity_kg, current_usage_kg FROM storage_facilities WHERE id = $1',
            [testData.facilityId]
        );

        if (facilityCheck.rows.length === 0) {
            console.error('❌ Facility not found');
            process.exit(1);
        }

        console.log('✅ Facility found:', facilityCheck.rows[0]);

        // Try insertion
        const result = await pool.query(`
            INSERT INTO inventory_transactions (
                facility_id, crop_type, quantity_kg, direction, reason,
                quality_grade, temperature_at_transaction, related_farmer_id, notes, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `, [
            testData.facilityId,
            testData.cropType,
            testData.quantityKg,
            'incoming',
            'harvest',
            testData.qualityGrade || null,
            testData.temperature || null,
            testData.farmerId || null,
            testData.notes || null,
            1
        ]);

        console.log('✅ Transaction created successfully:', result.rows[0]);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Error details:', error);
        process.exit(1);
    }
}

testIncomingTransaction();
