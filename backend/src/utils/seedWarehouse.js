const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Load .env from backend directory
require('dotenv').config({ path: path.join(__dirname, '../../../backend/.env') });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'aaywa_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

async function seedWarehouseData() {
    const logFile = path.join(process.cwd(), 'warehouse_seed.log');
    const log = (msg) => {
        fs.appendFileSync(logFile, msg + '\n');
        console.log(msg);
    };

    try {
        fs.writeFileSync(logFile, '=== Warehouse Seeding Started ===\n');
        log('Connecting to database...');

        // =============================================
        // 1. Seed Storage Facilities
        // =============================================
        log('\n1. Seeding storage facilities...');

        const facilities = [
            {
                name: 'Cold Room A',
                type: 'cold_room',
                location_name: 'Cohort 1 Farm - Huye District',
                location_lat: -2.5950,
                location_lng: 29.7400,
                capacity_kg: 500,
                current_usage_kg: 320,
                temperature_celsius: 8,
                humidity_percent: 75,
                status: 'operational',
                last_maintenance_date: new Date('2026-01-10')
            },
            {
                name: 'Insulated Shed B',
                type: 'insulated_shed',
                location_name: 'Cohort 3 Farm - Huye District',
                location_lat: -2.6100,
                location_lng: 29.7600,
                capacity_kg: 500,
                current_usage_kg: 300,
                temperature_celsius: 22,
                humidity_percent: 60,
                status: 'maintenance_due',
                maintenance_due_date: new Date('2026-02-01'),
                last_maintenance_date: new Date('2025-12-15')
            }
        ];

        for (const facility of facilities) {
            await pool.query(`
                INSERT INTO storage_facilities (
                    name, type, location_name, location_lat, location_lng, capacity_kg, current_usage_kg,
                    temperature_celsius, humidity_percent, status, maintenance_due_date, last_maintenance_date
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                ON CONFLICT DO NOTHING
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
                facility.maintenance_due_date || null,
                facility.last_maintenance_date || null
            ]);
        }
        log(`✅ Seeded ${facilities.length} storage facilities`);

        // =============================================
        // 2. Seed Inventory Transactions
        // =============================================
        log('\n2. Seeding inventory transactions...');

        const transactions = [
            // Incoming transactions
            { facility_id: 1, crop_type: 'avocado', quantity_kg: 200, direction: 'incoming', reason: 'harvest', quality_grade: 'A', temperature_at_transaction: 8, created_at: new Date('2026-02-01') },
            { facility_id: 1, crop_type: 'avocado', quantity_kg: 120, direction: 'incoming', reason: 'harvest', quality_grade: 'B', temperature_at_transaction: 8, created_at: new Date('2026-02-03') },
            { facility_id: 2, crop_type: 'macadamia', quantity_kg: 150, direction: 'incoming', reason: 'harvest', quality_grade: 'A', temperature_at_transaction: 22, created_at: new Date('2026-02-02') },
            { facility_id: 2, crop_type: 'macadamia', quantity_kg: 150, direction: 'incoming', reason: 'harvest', quality_grade: 'B', temperature_at_transaction: 22, created_at: new Date('2026-02-04') },

            // Outgoing sales
            { facility_id: 1, crop_type: 'avocado', quantity_kg: 50, direction: 'outgoing', reason: 'sale', temperature_at_transaction: 8, created_at: new Date('2026-02-02') },
            { facility_id: 2, crop_type: 'macadamia', quantity_kg: 80, direction: 'outgoing', reason: 'sale', temperature_at_transaction: 22, created_at: new Date('2026-02-03') },

            // Outgoing donations
            { facility_id: 1, crop_type: 'avocado', quantity_kg: 20, direction: 'outgoing', reason: 'donation', notes: 'Community training samples', created_at: new Date('2026-02-03') },
            { facility_id: 2, crop_type: 'macadamia', quantity_kg: 30, direction: 'outgoing', reason: 'donation', notes: 'Local school nutrition program', created_at: new Date('2026-02-04') },

            // Losses
            { facility_id: 1, crop_type: 'avocado', quantity_kg: 8, direction: 'outgoing', reason: 'damage', notes: 'Bruising during handling', created_at: new Date('2026-02-03') },
            { facility_id: 2, crop_type: 'macadamia', quantity_kg: 10, direction: 'outgoing', reason: 'spoilage', notes: 'Temperature spike overnight', created_at: new Date('2026-02-04') }
        ];

        for (const transaction of transactions) {
            await pool.query(`
                INSERT INTO inventory_transactions (
                    facility_id, crop_type, quantity_kg, direction, reason,
                    quality_grade, temperature_at_transaction, notes, status, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `, [
                transaction.facility_id,
                transaction.crop_type,
                transaction.quantity_kg,
                transaction.direction,
                transaction.reason,
                transaction.quality_grade || null,
                transaction.temperature_at_transaction || null,
                transaction.notes || null,
                'completed',
                transaction.created_at
            ]);
        }
        log(`✅ Seeded ${transactions.length} inventory transactions`);

        // =============================================
        // 3. Seed Temperature Logs
        // =============================================
        log('\n3. Seeding temperature logs...');

        const temperatureLogs = [];
        const now = new Date();

        // Generate temperature logs for last 7 days
        for (let day = 6; day >= 0; day--) {
            for (let hour = 0; hour < 24; hour += 4) {
                const timestamp = new Date(now);
                timestamp.setDate(timestamp.getDate() - day);
                timestamp.setHours(hour, 0, 0, 0);

                // Cold Room A (target: 8°C)
                const tempColdRoom = 7 + Math.random() * 2; // 7-9°C
                temperatureLogs.push({
                    facility_id: 1,
                    temperature_celsius: parseFloat(tempColdRoom.toFixed(1)),
                    humidity_percent: 70 + Math.random() * 10,
                    recorded_at: timestamp,
                    alert_triggered: tempColdRoom > 10
                });

                // Insulated Shed B (target: 22°C)
                const tempShed = 20 + Math.random() * 4; // 20-24°C
                temperatureLogs.push({
                    facility_id: 2,
                    temperature_celsius: parseFloat(tempShed.toFixed(1)),
                    humidity_percent: 55 + Math.random() * 10,
                    recorded_at: timestamp,
                    alert_triggered: tempShed > 25
                });
            }
        }

        for (const log_entry of temperatureLogs) {
            await pool.query(`
                INSERT INTO temperature_logs (
                    facility_id, temperature_celsius, humidity_percent, recorded_at, alert_triggered
                ) VALUES ($1, $2, $3, $4, $5)
            `, [
                log_entry.facility_id,
                log_entry.temperature_celsius,
                log_entry.humidity_percent,
                log_entry.recorded_at,
                log_entry.alert_triggered
            ]);
        }
        log(`✅ Seeded ${temperatureLogs.length} temperature log entries`);

        // =============================================
        // 4. Seed Maintenance Records
        // =============================================
        log('\n4. Seeding maintenance records...');

        const maintenanceRecords = [
            {
                facility_id: 1,
                issue_description: 'Compressor routine service',
                maintenance_type: 'preventive',
                cost: 8000,
                vendor_name: 'CoolTech Rwanda',
                status: 'completed',
                scheduled_date: new Date('2026-01-10'),
                completed_date: new Date('2026-01-10')
            },
            {
                facility_id: 2,
                issue_description: 'Roof leak repair',
                maintenance_type: 'reactive',
                cost: 12000,
                vendor_name: 'BuildRight Services',
                status: 'completed',
                scheduled_date: new Date('2025-12-15'),
                completed_date: new Date('2025-12-16')
            },
            {
                facility_id: 1,
                issue_description: 'Temperature sensor calibration',
                maintenance_type: 'preventive',
                cost: 3000,
                vendor_name: 'CoolTech Rwanda',
                status: 'scheduled',
                scheduled_date: new Date('2026-02-20')
            }
        ];

        for (const record of maintenanceRecords) {
            await pool.query(`
                INSERT INTO maintenance_records (
                    facility_id, issue_description, maintenance_type, cost,
                    vendor_name, status, scheduled_date, completed_date
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
                record.facility_id,
                record.issue_description,
                record.maintenance_type,
                record.cost,
                record.vendor_name,
                record.status,
                record.scheduled_date,
                record.completed_date || null
            ]);
        }
        log(`✅ Seeded ${maintenanceRecords.length} maintenance records`);

        // =============================================
        // 5. Seed Post-Harvest Losses
        // =============================================
        log('\n5. Seeding post-harvest loss records...');

        // Get the loss transaction IDs
        const damageTransaction = await pool.query(
            `SELECT id FROM inventory_transactions WHERE reason = 'damage' LIMIT 1`
        );
        const spoilageTransaction = await pool.query(
            `SELECT id FROM inventory_transactions WHERE reason = 'spoilage' LIMIT 1`
        );

        if (damageTransaction.rows.length > 0) {
            await pool.query(`
                INSERT INTO post_harvest_losses (
                    transaction_id, loss_category, loss_quantity_kg, loss_value,
                    root_cause, prevention_strategy
                ) VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                damageTransaction.rows[0].id,
                'physical_damage',
                8,
                12000,
                'Inadequate handling during sorting',
                'Provide handler training and use padded containers'
            ]);
        }

        if (spoilageTransaction.rows.length > 0) {
            await pool.query(`
                INSERT INTO post_harvest_losses (
                    transaction_id, loss_category, loss_quantity_kg, loss_value,
                    root_cause, prevention_strategy
                ) VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                spoilageTransaction.rows[0].id,
                'spoilage',
                10,
                15000,
                'Temperature spike due to power outage',
                'Install backup generator for cold room'
            ]);
        }
        log(`✅ Seeded post-harvest loss records`);

        // =============================================
        // Summary
        // =============================================
        log('\n=== Warehouse Seeding Completed Successfully ===');
        log(`✅ 2 storage facilities`);
        log(`✅ ${transactions.length} inventory transactions`);
        log(`✅ ${temperatureLogs.length} temperature logs`);
        log(`✅ ${maintenanceRecords.length} maintenance records`);
        log(`✅ 2 post-harvest loss records`);

        process.exit(0);
    } catch (error) {
        log(`\n❌ Error during seeding: ${error.message}`);
        log(error.stack);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    seedWarehouseData();
}

module.exports = seedWarehouseData;
