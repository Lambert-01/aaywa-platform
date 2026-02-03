const pool = require('../config/database');

async function seedTrainingData() {
    try {
        console.log('Starting training data seeding...');

        // Get some users and cohorts for reference
        const usersResult = await pool.query('SELECT id FROM users LIMIT 5');
        const cohortsResult = await pool.query('SELECT id FROM cohorts LIMIT 4');
        const farmersResult = await pool.query('SELECT id, cohort_id FROM farmers LIMIT 30');

        if (usersResult.rows.length === 0 || cohortsResult.rows.length === 0) {
            console.log('Please seed users and cohorts first');
            return;
        }

        const users = usersResult.rows;
        const cohorts = cohortsResult.rows;
        const farmers = farmersResult.rows;

        // ==================== TRAINING SESSIONS ====================
        console.log('Seeding training sessions...');

        const sessionTypes = ['Master Training', 'Champion Training', 'VSLA', 'Nutrition', 'Agronomy'];
        const locations = [
            'Cohort 1 Farm',
            'Cohort 2 Farm',
            'Cohort 3 Farm',
            'Cohort 4 Farm',
            'Community Center',
            'Field Demonstration Plot'
        ];

        const sessionTopics = {
            'Master Training': [
                'Organic Pest Management',
                'Soil Health and Composting',
                'Crop Rotation Strategies',
                'Water Conservation Techniques'
            ],
            'Champion Training': [
                'Compost Quality Assessment',
                'Avocado Pruning Techniques',
                'Peer Mentoring Skills',
                'Field Demonstration Methods'
            ],
            'VSLA': [
                'VSLA Loan Management',
                'Savings Group Formation',
                'Financial Record Keeping',
                'Group Governance'
            ],
            'Nutrition': [
                'Nutrition and Food Security',
                'Balanced Diet Planning',
                'Food Preparation and Storage',
                'Child Nutrition'
            ],
            'Agronomy': [
                'Integrated Pest Management',
                'Fertilizer Application',
                'Seed Selection',
                'Harvest and Post-Harvest Handling'
            ]
        };

        const trainingSessionsData = [];
        let sessionDate = new Date('2026-01-15');

        for (let i = 0; i < 24; i++) {
            const sessionType = sessionTypes[i % sessionTypes.length];
            const topicsArray = sessionTopics[sessionType];
            const topic = topicsArray[Math.floor(Math.random() * topicsArray.length)];

            const cohort = cohorts[i % cohorts.length];
            const trainer = users[i % users.length];
            const location = locations[i % locations.length];

            // Vary dates
            sessionDate.setDate(sessionDate.getDate() + Math.floor(Math.random() * 5) + 3);

            const expectedAttendees = 20 + Math.floor(Math.random() * 10);
            const actualAttendees = i < 18 ? expectedAttendees - Math.floor(Math.random() * 5) : 0; // Future sessions have 0 actual
            const status = i < 18 ? 'Completed' : 'Scheduled';
            const childcareProvided = Math.random() > 0.4;

            const materials = [];
            if (sessionType === 'Master Training') {
                materials.push(`${topic} Guide v2.0`, 'Visual Aids');
            } else if (sessionType === 'Champion Training') {
                materials.push(`${topic} Handbook`, 'Demonstration Kit');
            } else if (sessionType === 'VSLA') {
                materials.push('VSLA Handbook', 'Passbooks', 'Calculator Sheets');
            } else if (sessionType === 'Nutrition') {
                materials.push('Nutrition Guide', 'Recipe Cards', 'Food Charts');
            } else {
                materials.push(`${topic} Manual`, 'Field Tools');
            }

            trainingSessionsData.push({
                title: topic,
                cohort_id: cohort.id,
                trainer_id: trainer.id,
                session_type: sessionType,
                date: new Date(sessionDate),
                duration_hours: 2.0 + (Math.random() * 1.5),
                location,
                childcare_provided: childcareProvided,
                materials: JSON.stringify(materials),
                expected_attendees: expectedAttendees,
                actual_attendees: actualAttendees,
                status,
                notes: status === 'Completed' ? 'High engagement from participants' : null
            });
        }

        for (const session of trainingSessionsData) {
            await pool.query(`
        INSERT INTO training_sessions (
          title, cohort_id, trainer_id, session_type, date, duration_hours,
          location, childcare_provided, materials, expected_attendees,
          actual_attendees, status, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
                session.title,
                session.cohort_id,
                session.trainer_id,
                session.session_type,
                session.date,
                session.duration_hours,
                session.location,
                session.childcare_provided,
                session.materials,
                session.expected_attendees,
                session.actual_attendees,
                session.status,
                session.notes
            ]);
        }

        console.log(`Seeded ${trainingSessionsData.length} training sessions`);

        // ==================== ATTENDANCE RECORDS ====================
        console.log('Seeding attendance records...');

        const sessionsResult = await pool.query('SELECT id, cohort_id, expected_attendees, status FROM training_sessions WHERE status = $1', ['Completed']);

        let attendanceCount = 0;
        for (const session of sessionsResult.rows) {
            // Get farmers from the same cohort
            const cohortFarmers = farmers.filter(f => f.cohort_id === session.cohort_id);

            // Random but realistic attendance
            const attendeeCount = Math.min(session.expected_attendees - Math.floor(Math.random() * 3), cohortFarmers.length);

            for (let i = 0; i < attendeeCount; i++) {
                if (cohortFarmers[i]) {
                    const attendance_status = Math.random() > 0.05 ? 'present' : (Math.random() > 0.5 ? 'late' : 'absent');
                    const check_in_method = Math.random() > 0.7 ? 'mobile_app' : (Math.random() > 0.5 ? 'manual' : 'ussd');
                    const childcare_used = Math.random() > 0.7;
                    const feedback_score = attendance_status === 'present' ? Math.floor(Math.random() * 2) + 4 : null; // 4 or 5

                    await pool.query(`
            INSERT INTO training_attendance (
              session_id, farmer_id, attendance_status, check_in_method,
              check_in_time, childcare_used, feedback_score
            )
            VALUES ($1, $2, $3, $4, NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days', $5, $6)
          `, [
                        session.id,
                        cohortFarmers[i].id,
                        attendance_status,
                        check_in_method,
                        childcare_used,
                        feedback_score
                    ]);

                    attendanceCount++;
                }
            }
        }

        console.log(`Seeded ${attendanceCount} attendance records`);

        // ==================== LEARNING MATERIALS ====================
        console.log('Seeding learning materials...');

        const materials = [
            { title: 'Compost Quality Guide', category: 'Compost', file_type: 'PDF', version: '2.1', description: 'Comprehensive guide to assessing compost quality' },
            { title: 'Avocado Pruning Video', category: 'Agronomy', file_type: 'Video', version: '1.0', description: 'Step-by-step video on proper avocado pruning' },
            { title: 'VSLA Handbook', category: 'VSLA', file_type: 'PDF', version: '3.0', description: 'Complete VSLA operations manual' },
            { title: 'Nutrition Guide', category: 'Nutrition', file_type: 'PDF', version: '1.5', description: 'Family nutrition and meal planning guide' },
            { title: 'Pest Management Poster', category: 'Agronomy', file_type: 'Image', version: '1.0', description: 'Visual guide to common pests and solutions' },
            { title: 'Soil Health Audio Course', category: 'Agronomy', file_type: 'Audio', version: '1.0', description: 'Audio lessons on soil health (Kinyarwanda)' },
            { title: 'Recipe Cards Collection', category: 'Nutrition', file_type: 'PDF', version: '2.0', description: 'Nutritious recipes using local ingredients' },
            { title: 'Champion Training Manual', category: 'Business Skills', file_type: 'PDF', version: '1.0', description: 'Peer mentoring and facilitation skills' },
            { title: 'Fertilizer Application Chart', category: 'Agronomy', file_type: 'Image', version: '1.2', description: 'Crop-specific fertilizer recommendations' },
            { title: 'Food Storage Best Practices', category: 'Nutrition', file_type: 'Video', version: '1.0', description: 'Post-harvest storage techniques' }
        ];

        for (const material of materials) {
            await pool.query(`
        INSERT INTO learning_materials (
          title, category, file_type, file_url, version, description,
          download_count, uploaded_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
                material.title,
                material.category,
                material.file_type,
                `/materials/${material.title.toLowerCase().replace(/\s+/g, '-')}.${material.file_type.toLowerCase()}`,
                material.version,
                material.description,
                Math.floor(Math.random() * 150),
                users[0].id
            ]);
        }

        console.log(`Seeded ${materials.length} learning materials`);

        // ==================== CHAMPIONS ====================
        console.log('Seeding champions...');

        // Create 20 champions
        for (let i = 0; i < Math.min(20, farmers.length); i++) {
            const farmer = farmers[i];
            const certifiedDate = new Date('2025-11-01');
            certifiedDate.setDate(certifiedDate.getDate() + (i * 3));

            await pool.query(`
        INSERT INTO champions (
          farmer_id, cohort_id, certified_date, peers_assigned,
          peers_trained, sessions_led, avg_attendance_rate, avg_feedback_score
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (farmer_id) DO NOTHING
      `, [
                farmer.id,
                farmer.cohort_id,
                certifiedDate,
                5 + Math.floor(Math.random() * 3), // 5-7 peers assigned
                3 + Math.floor(Math.random() * 4), // 3-6 peers trained
                2 + Math.floor(Math.random() * 3), // 2-4 sessions led
                75 + Math.random() * 20, // 75-95% attendance
                4 + Math.random() * 1 // 4-5 feedback score
            ]);
        }

        console.log('Seeded 20 champions');

        console.log('Training data seeding completed successfully!');

    } catch (error) {
        console.error('Error seeding training data:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    seedTrainingData()
        .then(() => {
            console.log('Seeding complete');
            process.exit(0);
        })
        .catch(error => {
            console.error('Seeding failed:', error);
            process.exit(1);
        });
}

module.exports = seedTrainingData;
