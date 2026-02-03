const { Pool } = require('pg');
require('dotenv').config();
const VSLA = require('../models/VSLA');

// Helper to mock pool since VSLA model uses required pool instance
// We actually need the real pool connection, but we can rely on VSLA importing the same config.
// However, VSLA.js imports pool from '../config/database'. We need to make sure that initializes correctly based on .env
// Since I'm running this script with node, I need to ensure .env is loaded BEFORE VSLA is required if VSLA initializes pool at top level.
// VSLA.js has `const pool = require('../config/database');` at top.
// database.js inspects process.env at that moment.
// So I must load dotenv here BEFORE requiring VSLA, which I did above.

async function verifyModel() {
    try {
        console.log('🧪 Verifying VSLA Model Queries...');

        // 1. Get a VSLA ID
        const vslas = await VSLA.findAll();
        if (vslas.length === 0) {
            console.log('⚠️ No VSLAs found. Trying to seed first...');
            // In a real scenario I might abort, but let's see.
            return;
        }

        const testId = vslas[0].id;
        console.log(`👍 Testing with VSLA ID: ${testId} (${vslas[0].name})`);

        // 2. Test getMembers
        console.log('   Testing getMembers...');
        const members = await VSLA.getMembers(testId);
        console.log(`   ✅ getMembers success! Found ${members.length} members.`);

        // 3. Test getOfficers
        console.log('   Testing getOfficers...');
        const officers = await VSLA.getOfficers(testId);
        console.log(`   ✅ getOfficers success! Found ${officers.length} officers.`);

        // 4. Test getTransactions
        console.log('   Testing getTransactions...');
        const txns = await VSLA.getTransactions(testId);
        console.log(`   ✅ getTransactions success! Found ${txns.length} transactions.`);

        console.log('🎉 ALL MODEL TESTS PASSED!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Model Verification Failed:', error);
        process.exit(1);
    }
}

verifyModel();
