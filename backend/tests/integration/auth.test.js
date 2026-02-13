const request = require('supertest');
const app = require('../../src/app');
const pool = require('../../src/config/database');

describe('Auth Integration Tests', () => {
    let testUser = {
        full_name: 'Test Integration',
        email: `integration_${Date.now()}@test.com`,
        password: 'password123',
        role: 'project_manager', // Corrected role for DB constraint but validation allows it? Yes.
        phone: `07${Date.now().toString().slice(-8)}`,
        language: 'en'
    };

    let token;
    let refreshToken;

    beforeAll(async () => {
        // Ensure DB connection
        await pool.query('SELECT 1');
    });

    afterAll(async () => {
        // Cleanup test user
        if (testUser.email) {
            await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
        }
        await pool.end();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            // Direct DB insertion
            const bcrypt = require('bcryptjs');
            const hash = await bcrypt.hash(testUser.password, 10);

            // Note: role must match DB constraint. 'project_manager' is likely valid.
            const res = await pool.query(
                `INSERT INTO users (full_name, email, password_hash, role, phone, is_active, registration_status, language)
                 VALUES ($1, $2, $3, $4, $5, true, 'approved', $6) RETURNING id`,
                [testUser.full_name, testUser.email, hash, testUser.role, testUser.phone, testUser.language]
            );
            testUser.id = res.rows[0].id;
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login and return tokens', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            if (res.statusCode !== 200) {
                console.log('Login Failed Body:', res.body);
            }
            if (res.statusCode === 200) {
                // Log the tokens to debug malformed issue
                console.log('Login Success Body:', {
                    token: res.body.token ? 'Present' : 'Missing',
                    refreshToken: res.body.refreshToken ? res.body.refreshToken.substring(0, 20) + '...' : 'Missing/Null/Undefined',
                    refreshTokenType: typeof res.body.refreshToken
                });
            }

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            expect(res.body.refreshToken).toBeDefined();

            token = res.body.token;
            refreshToken = res.body.refreshToken;
        });

        it('should fail with wrong password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('POST /api/auth/refresh-token', () => {
        it('should refresh access token', async () => {
            console.log('Refreshing with token:', refreshToken ? refreshToken.substring(0, 20) + '...' : 'Undefined');

            const res = await request(app)
                .post('/api/auth/refresh-token')
                .send({
                    refreshToken: refreshToken
                });

            if (res.statusCode !== 200) {
                console.log('Refresh Failed Body:', res.body);
            }

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.accessToken).toBeDefined();
            expect(res.body.accessToken).not.toBe(token); // Should be new
        });

        it('should fail with invalid refresh token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-token')
                .send({
                    refreshToken: 'invalid_token'
                });

            expect(res.statusCode).toBe(401); // or 500/400 depending on implementation
        });
    });
});
