const fs = require('fs');
const path = require('path');
const seedTrainingData = require('./seedTraining');

const logFile = path.join(process.cwd(), 'seed_log.txt');
const logStream = fs.createWriteStream(logFile);

// Override console methods to write to file
const originalLog = console.log;
const originalError = console.error;

console.log = function (...args) {
    const msg = args.map(arg => String(arg)).join(' ');
    logStream.write(msg + '\n');
    // originalLog.apply(console, args);
};

console.error = function (...args) {
    const msg = args.map(arg => String(arg)).join(' ');
    logStream.write('ERROR: ' + msg + '\n');
    // originalError.apply(console, args);
};

console.log('Starting seed wrapper...');

seedTrainingData()
    .then(() => {
        console.log('Seeding wrapper complete');
        logStream.end();
        // Give time for stream to flush
        setTimeout(() => process.exit(0), 1000);
    })
    .catch(error => {
        console.error('Seeding wrapper failed:', error);
        logStream.end();
        setTimeout(() => process.exit(1), 1000);
    });
