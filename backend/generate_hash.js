const bcrypt = require('bcryptjs');
const fs = require('fs');

const password = 'AdminPass123!';
const saltRounds = 12;

bcrypt.hash(password, saltRounds, function (err, hash) {
    if (err) {
        console.error(err);
        return;
    }
    fs.writeFileSync('hash.txt', hash);
    console.log('Hash generated and saved to hash.txt');
});
