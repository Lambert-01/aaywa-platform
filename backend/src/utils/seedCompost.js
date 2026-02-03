const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const pool = require('../config/database');

/**
 * Seed realistic compost production data
 * This creates sample batches with feedstock composition, workdays, and sales
 */
async function seedCompostData() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('🌱 Seeding compost production data...');

        // Sample batches with realistic East African feedstock materials
        const batches = [
            {
                batch_number: 'COMP-2026-001',
                start_date: '2026-01-05',
                production_date: '2026-01-05',
                maturity_date: '2026-02-20',
                quantity_kg: 450,
                quality_score: 8.5,
                status: 'Mature',
                cohort_id: 1,
                feedstock: [
                    { material_type: 'Maize Stalks', percentage: 40, kg_amount: 200, cost_per_kg: 50 },
                    { material_type: 'Banana Leaves', percentage: 30, kg_amount: 150, cost_per_kg: 30 },
                    { material_type: 'Coffee Pulp', percentage: 20, kg_amount: 100, cost_per_kg: 40 },
                    { material_type: 'Avocado Prunings', percentage: 10, kg_amount: 50, cost_per_kg: 35 }
                ],
                workers: [
                    { worker_name: 'Marie Uwase', days: 12, tasks: 'Turning compost, Moisture monitoring' },
                    { worker_name: 'Jean-Paul Habimana', days: 8, tasks: 'Feedstock mixing, Temperature checks' }
                ],
                sales: [
                    { buyer_name: 'Kigali Urban Farms', buyer_contact: '+250 788 123 456', kg_sold: 150, price_per_kg: 600, sale_date: '2026-01-28' }
                ]
            },
            {
                batch_number: 'COMP-2026-002',
                start_date: '2026-01-15',
                production_date: '2026-01-15',
                maturity_date: '2026-03-01',
                quantity_kg: 480,
                quality_score: null,
                status: 'Curing',
                cohort_id: 2,
                feedstock: [
                    { material_type: 'Maize Stalks', percentage: 50, kg_amount: 250, cost_per_kg: 50 },
                    { material_type: 'Banana Leaves', percentage: 30, kg_amount: 150, cost_per_kg: 30 },
                    { material_type: 'Bean Stalks', percentage: 20, kg_amount: 100, cost_per_kg: 45 }
                ],
                workers: [
                    { worker_name: 'Grace Mukeshimana', days: 10, tasks: 'Pile construction, turning' }
                ],
                sales: []
            },
            {
                batch_number: 'COMP-2026-003',
                start_date: '2026-01-22',
                production_date: '2026-01-22',
                maturity_date: '2026-03-08',
                quantity_kg: 0,
                quality_score: null,
                status: 'In Progress',
                cohort_id: 3,
                feedstock: [
                    { material_type: 'Coffee Pulp', percentage: 60, kg_amount: 300, cost_per_kg: 40 },
                    { material_type: 'Banana Leaves', percentage: 40, kg_amount: 200, cost_per_kg: 30 }
                ],
                workers: [],
                sales: []
            }
        ];

        // Get a sample user to assign as producer
        const userResult = await client.query(
            "SELECT id FROM users WHERE role = 'agronomist' LIMIT 1"
        );

        const producerId = userResult.rows[0]?.id || 1;

        for (const batch of batches) {
            // Check if batch already exists
            const existingBatch = await client.query(
                'SELECT id FROM compost_batches WHERE batch_number = $1',
                [batch.batch_number]
            );

            if (existingBatch.rows.length > 0) {
                console.log(`⏭️  Batch ${batch.batch_number} already exists, skipping...`);
                continue;
            }

            // Create batch
            const batchResult = await client.query(
                `INSERT INTO compost_batches 
                (batch_number, start_date, production_date, maturity_date, quantity_kg, quality_score, status, cohort_id, produced_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id`,
                [
                    batch.batch_number,
                    batch.start_date,
                    batch.production_date,
                    batch.maturity_date,
                    batch.quantity_kg,
                    batch.quality_score,
                    batch.status,
                    batch.cohort_id,
                    producerId
                ]
            );

            const batchId = batchResult.rows[0].id;
            console.log(`✅ Created batch: ${batch.batch_number} (ID: ${batchId})`);

            // Add feedstock items
            for (const item of batch.feedstock) {
                await client.query(
                    `INSERT INTO compost_feedstock_items 
                    (batch_id, material_type, percentage, kg_amount, cost_per_kg)
                    VALUES ($1, $2, $3, $4, $5)`,
                    [batchId, item.material_type, item.percentage, item.kg_amount, item.cost_per_kg]
                );
            }
            console.log(`   📦 Added ${batch.feedstock.length} feedstock items`);

            // Add workdays
            for (const worker of batch.workers) {
                // Try to find the worker by name, or use default user
                const workerResult = await client.query(
                    'SELECT id FROM users WHERE full_name = $1 LIMIT 1',
                    [worker.worker_name]
                );

                const workerId = workerResult.rows[0]?.id || producerId;

                for (let day = 0; day < worker.days; day++) {
                    const workDate = new Date(batch.start_date);
                    workDate.setDate(workDate.getDate() + day);

                    await client.query(
                        `INSERT INTO compost_workdays 
                        (worker_id, batch_id, date_worked, hours_worked, daily_wage, payment_status)
                        VALUES ($1, $2, $3, $4, $5, $6)`,
                        [
                            workerId,
                            batchId,
                            workDate.toISOString().split('T')[0],
                            8,
                            3000,
                            batch.status === 'Mature' ? 'paid' : 'pending'
                        ]
                    );
                }
            }
            console.log(`   👷 Added workdays for ${batch.workers.length} workers`);

            // Add sales
            for (const sale of batch.sales) {
                await client.query(
                    `INSERT INTO compost_sales 
                    (batch_id, buyer_name, buyer_contact, kg_sold, price_per_kg, sale_date, payment_method, created_by)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [
                        batchId,
                        sale.buyer_name,
                        sale.buyer_contact,
                        sale.kg_sold,
                        sale.price_per_kg,
                        sale.sale_date,
                        'Mobile Money',
                        producerId
                    ]
                );
            }
            if (batch.sales.length > 0) {
                console.log(`   💰 Added ${batch.sales.length} sales records`);
            }
        }

        await client.query('COMMIT');
        console.log('✨ Compost data seeding complete!');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding compost data:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run seeding if called directly
if (require.main === module) {
    seedCompostData()
        .then(() => {
            console.log('🎉 Seeding completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Failed to seed data:', error);
            process.exit(1);
        });
}

module.exports = { seedCompostData };
