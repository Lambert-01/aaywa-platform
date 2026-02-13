const http = require('http');

function request(options, postData) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = data ? JSON.parse(data) : {};
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });
        req.on('error', reject);
        if (postData) req.write(JSON.stringify(postData));
        req.end();
    });
}

async function test() {
    const host = 'localhost';
    const port = 5000;

    try {
        console.log('--- Testing Login ---');
        const loginRes = await request({
            host, port, path: '/api/auth/login-mobile', method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            email: 'admin@aaywa.rw',
            password: 'AdminPass123!'
        });

        if (loginRes.status !== 200) {
            console.error('Login Failed:', loginRes.status, loginRes.data);
            return;
        }

        const token = loginRes.data.token;
        const user = loginRes.data.user;
        console.log(`Logged in as: ${user.full_name} (${user.role})`);

        const authHeader = `Bearer ${token}`;

        console.log('\n--- Testing VSLA Summary ---');
        const vslaRes = await request({
            host, port, path: '/api/vsla/summary', method: 'GET',
            headers: { Authorization: authHeader }
        });
        console.log('VSLA Summary Status:', vslaRes.status);
        console.log('VSLA Summary Data:', JSON.stringify(vslaRes.data, null, 2));

        console.log('\n--- Testing My Sales ---');
        const salesRes = await request({
            host, port, path: '/api/sales/my-sales', method: 'GET',
            headers: { Authorization: authHeader }
        });
        console.log('My Sales Status:', salesRes.status);
        if (Array.isArray(salesRes.data)) {
            console.log('My Sales Count:', salesRes.data.length);
        } else {
            console.log('My Sales Data:', salesRes.data);
        }

        console.log('\n--- Testing VSLA Groups (Mobile Style) ---');
        const groupsMobileRes = await request({
            host, port, path: '/api/vsla/groups', method: 'GET',
            headers: { Authorization: authHeader }
        });
        console.log('VSLA Groups (Mobile) Status:', groupsMobileRes.status);
        console.log('VSLA Groups (Mobile) Data:', JSON.stringify(groupsMobileRes.data).substring(0, 100));

        console.log('\n--- Testing All VSLA Groups (Base) ---');
        const groupsRes = await request({
            host, port, path: '/api/vsla', method: 'GET',
            headers: { Authorization: authHeader }
        });
        console.log('All VSLA Groups Status:', groupsRes.status);

        console.log('\n--- Testing Farmers List ---');
        const farmersRes = await request({
            host, port, path: '/api/farmers', method: 'GET',
            headers: { Authorization: authHeader }
        });
        console.log('Farmers List Status:', farmersRes.status);

    } catch (e) {
        console.error('Test Error:', e.message);
    }
}

test();
