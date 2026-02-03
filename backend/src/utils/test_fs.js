const fs = require('fs');
const path = require('path');
const logFile = path.join(process.cwd(), 'test_log.txt');
fs.writeFileSync(logFile, 'Hello from file system!');
console.log('File written');
