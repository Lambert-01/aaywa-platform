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

async function resetWarehouseData() {
    try {
        console.log('🗑️  Deleting all warehouse data...\n');

        // Delete in correct order (child tables first due to foreign keys)
        await pool.query('DELETE FROM post_harvest_losses');
        console.log('✅ Deleted post_harvest_losses');

        await pool.query('DELETE FROM maintenance_records');
        console.log('✅ Deleted maintenance_records');

        await pool.query('DELETE FROM temperature_logs');
        console.log('✅ Deleted temperature_logs');

        await pool.query('DELETE FROM inventory_transactions');
        console.log('✅ Deleted inventory_transactions');

        await pool.query('DELETE FROM storage_facilities');
        console.log('✅ Deleted storage_facilities');

        console.log('\n📝 Reseeding fresh warehouse data...\n');

        // Insert facilities with GPS coordinates
        const facilities = [
            {
                name: 'Cold Room A',
                type: 'cold_room',
                location_name: 'Cohort 1 Farm - Huye District',
                location_lat: -2.5950,
                location_lng: 29.7400,
                capacity_kg: 500,
                current_usage_kg: 0, // Start empty
                temperature_celsius: 8,
                humidity_percent: 75,
                status: 'operational',
                description: 'Primary cold storage for avocados and vegetables',
                temperature_min: 2,
                temperature_max: 10,
                last_maintenance_date: new Date('2026-01-10')
            },
            {
                name: 'Insulated Shed B',
                type: 'insulated_shed',
                location_name: 'Cohort 2 Farm - Huye District',
                location_lat: -2.6100,
                location_lng: 29.7600,
                capacity_kg: 800,
                current_usage_kg: 0, // Start empty
                temperature_celsius: 18,
                humidity_percent: 60,
                status: 'operational',
                description: 'Insulated storage for grains and dried produce',
                last_maintenance_date: new Date('2026-01-15')
            }
        ];

        for (const facility of facilities) {
            const result = await pool.query(`
                INSERT INTO storage_facilities (
                    name, type, location_name, location_lat, location_lng, 
                    capacity_kg, current_usage_kg, temperature_celsius, humidity_percent, 
                    status, description, temperature_min, temperature_max,
                    maintenance_due_date, last_maintenance_date
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                RETURNING *
            `, [
                facility.name,
                facility.type,
                facility.location_name,
                facility.location_lat,
                facility.location_lng,
                facility.capacity_kg,
                facility.current_usage_kg,
                facility.temperature_celsius,
                facility.humidity_percent,
                facility.status,
                facility.description,
                facility.temperature_min || null,
                facility.temperature_max || null,
                facility.maintenance_due_date || null,
                facility.last_maintenance_date
            ]);

            console.log(`✅ Created facility: ${facility.name} (ID: ${result.rows[0].id})`);
            console.log(`   📍 Location: ${facility.location_lat}, ${facility.location_lng}`);
        }

        // Verify
        const count = await pool.query('SELECT COUNT(*) FROM storage_facilities');
        console.log(`\n✅ Reset complete! ${count.rows[0].count} facilities created with GPS coordinates`);

        console.log('\n📊 Current facilities:');
        const allFacilities = await pool.query('SELECT id, name, location_lat, location_lng, capacity_kg, current_usage_kg FROM storage_facilities');
        allFacilities.rows.forEach(f => {
            console.log(`   ${f.id}. ${f.name} - GPS: (${f.location_lat}, ${f.location_lng}) - ${f.current_usage_kg}/${f.capacity_kg} kg`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

resetWarehouseData();
