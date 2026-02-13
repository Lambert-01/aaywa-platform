const fs = require('fs');
const path = require('path');
const db = require('./src/config/database');

/**
 * Seed Database Script
 * Usage: node seed_database.js <seed_file.sql>
 */

async function seedDatabase(seedFile) {
    try {
        console.log(`\n🌱 Seeding database: ${seedFile}\n`);

        const seedPath = path.join(__dirname, 'src', 'seeds', seedFile);

        if (!fs.existsSync(seedPath)) {
            throw new Error(`Seed file not found: ${seedPath}`);
        }

        const sql = fs.readFileSync(seedPath, 'utf8');

        const result = await db.query(sql);

        console.log('✅ Database seeded successfully!');

        if (result.rows && result.rows.length > 0) {
            console.log(`\n${result.rows[0].status}\n`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

const seedFile = process.argv[2];

if (!seedFile) {
    console.error('❌ Usage: node seed_database.js <seed_file.sql>');
    process.exit(1);
}

seedDatabase(seedFile);
