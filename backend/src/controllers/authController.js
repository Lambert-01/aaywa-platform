const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for authenticated user
 * @param {object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
    const expiresIn = process.env.JWT_EXPIRES_IN || '86400'; // 24 hours default

    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            // Include farmer context if available
            farmer_id: user.farmer_id,
            cohort_id: user.cohort_id,
            vsla_id: user.vsla_id
        },
        // Ensure we use a string even if env is missing (fallback)
        process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod',
        { expiresIn: parseInt(expiresIn) }
    );
};

/**
 * Generate Refresh Token
 * @param {object} user - User object
 * @returns {string} Refresh token
 */
const generateRefreshToken = (user) => {
    const expiresIn = '7d'; // 7 days

    return jwt.sign(
        {
            id: user.id,
            type: 'refresh'
        },
        process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
        { expiresIn }
    );
};

const authController = {
    /**
     * Refresh Access Token
     * POST /api/auth/refresh-token
     */
    refreshToken: async (req, res) => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    error: 'refresh_token_required',
                    message: 'Refresh token is required'
                });
            }

            // Verify refresh token
            const decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret'
            );

            if (decoded.type !== 'refresh') {
                return res.status(401).json({
                    error: 'invalid_token_type',
                    message: 'Invalid token type'
                });
            }

            // Check if user still exists and is active
            const user = await User.findById(decoded.id);
            if (!user || !user.is_active) {
                return res.status(401).json({
                    error: 'user_inactive',
                    message: 'User is no longer active'
                });
            }

            // Generate new access token
            const accessToken = generateToken(user);

            res.json({
                success: true,
                accessToken
            });

        } catch (error) {
            console.error('Refresh token error:', error);
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    error: 'token_expired',
                    message: 'Refresh token has expired, please login again'
                });
            }
            res.status(401).json({
                error: 'invalid_token',
                message: 'Invalid refresh token'
            });
        }
    },

    /**
     * Register new user (admin only - middleware enforces this)
     * POST /api/auth/register
     */
    register: async (req, res) => {
        try {
            const { full_name, email, password, role, phone, language } = req.body;

            // Check if email already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    error: 'Email exists',
                    message: 'A user with this email address is already registered'
                });
            }

            // Check if phone exists (if provided)
            if (phone) {
                const phoneExists = await User.findByPhone(phone);
                if (phoneExists) {
                    return res.status(409).json({
                        error: 'Phone exists',
                        message: 'A user with this phone number is already registered'
                    });
                }
            }

            // Create user with hashed password
            const user = await User.create({
                phone: phone || null,
                full_name,
                email,
                password,
                role,
                language
            });

            // Log security event
            console.log(`[SECURITY] New user registered: ${user.id} (${user.role}) - ${user.email}`);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                error: 'Registration failed',
                message: 'An error occurred while registering the user'
            });
        }
    },

    /**
     * Login with Email and Password
     * POST /api/auth/login
     */
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // 1. Find the user first
            let user = await User.findByEmail(email);
            if (!user) {
                user = await User.findByPhone(email);
            }

            if (!user) {
                return res.status(401).json({
                    error: 'Authentication failed',
                    message: 'Invalid email or password'
                });
            }

            // 2. Check registration status
            if (user.registration_status === 'pending') {
                return res.status(403).json({
                    error: 'Pending Approval',
                    message: 'Your registration request is still pending approval. Please try again later.'
                });
            }

            // 3. Check if active
            if (!user.is_active) {
                return res.status(403).json({
                    error: 'Account disabled',
                    message: 'Your account has been deactivated. Please contact an administrator.'
                });
            }

            // 4. Verify credentials
            const bcrypt = require('bcryptjs');
            const isValid = await bcrypt.compare(password, user.password_hash);
            if (!isValid) {
                return res.status(401).json({
                    error: 'Authentication failed',
                    message: 'Invalid email or password'
                });
            }

            // Update last login timestamp
            await User.updateLastLogin(user.id);

            // Fetch farmer details for token if applicable
            let farmerDetails = {};
            if (['farmer', 'champion', 'agronomist', 'field_facilitator'].includes(user.role)) {
                try {
                    const pool = require('../config/database');
                    const farmerRes = await pool.query('SELECT id as farmer_id, cohort_id, vsla_id FROM farmers WHERE user_id = $1', [user.id]);
                    if (farmerRes.rows.length > 0) {
                        farmerDetails = farmerRes.rows[0];
                    }
                } catch (e) {
                    console.warn('[AUTH] Failed to attach farmer context (login):', e.message);
                }
            }

            // Generate JWT tokens - NOW passing farmerDetails into the user object so token has them
            const userForToken = { ...user, ...farmerDetails };
            const accessToken = generateToken(userForToken);
            const refreshToken = generateRefreshToken(user);

            // Log successful login
            console.log(`[SECURITY] Successful login: ${user.id} - ${user.email}`);

            res.json({
                success: true,
                message: 'Login successful',
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    language: user.language,
                    last_login: new Date(),
                    ...farmerDetails
                },
                token: accessToken,
                refreshToken
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                error: 'Login failed',
                message: 'An error occurred during login'
            });
        }
    },

    /**
     * Mobile Specific Login
     * POST /api/auth/login-mobile
     * Higher security logging and rate-limited via routes
     */
    loginMobile: async (req, res) => {
        try {
            const { email, password } = req.body;

            // 1. Find user
            let user = await User.findByEmail(email);
            if (!user) {
                user = await User.findByPhone(email);
            }

            if (!user) {
                console.warn(`[SECURITY] Mobile login failed: Invalid credentials for ${email}`);
                return res.status(401).json({
                    error: 'Authentication failed',
                    message: 'Invalid email or password'
                });
            }

            // 2. Check status
            if (user.registration_status === 'pending') {
                console.warn(`[SECURITY] Mobile login blocked: Pending approval for ${email}`);
                return res.status(403).json({
                    error: 'Pending Approval',
                    message: 'Your registration request is still pending approval. Please try again later.'
                });
            }

            // 3. Check active
            if (!user.is_active) {
                console.warn(`[SECURITY] Mobile login blocked: Account inactive for ${email}`);
                return res.status(403).json({
                    error: 'Account disabled',
                    message: 'Your account has been deactivated. Please contact an administrator.'
                });
            }

            // 4. Verify password
            const bcrypt = require('bcryptjs');
            const isValid = await bcrypt.compare(password, user.password_hash);
            if (!isValid) {
                console.warn(`[SECURITY] Mobile login failed: Invalid password for ${email}`);
                return res.status(401).json({
                    error: 'Authentication failed',
                    message: 'Invalid email or password'
                });
            }

            // Update last login timestamp
            await User.updateLastLogin(user.id);

            // Fetch details (cohort, vsla) for mobile context
            let mobileProfile = {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                language: user.language,
                last_login: new Date()
            };

            // Include associated farmer data for relevant roles
            if (['farmer', 'champion', 'agronomist', 'field_facilitator'].includes(user.role)) {
                try {
                    const pool = require('../config/database');
                    const farmerRes = await pool.query('SELECT id, cohort_id, vsla_id FROM farmers WHERE user_id = $1', [user.id]);
                    if (farmerRes.rows.length > 0) {
                        const f = farmerRes.rows[0];
                        mobileProfile.farmer_id = f.id;
                        mobileProfile.cohort_id = f.cohort_id;
                        mobileProfile.vsla_id = f.vsla_id;
                    }
                } catch (e) {
                    console.warn('[AUTH] Failed to attach farmer context:', e.message);
                }
            }

            // Generate JWT tokens - passing full profile with farmer_id
            const accessToken = generateToken(mobileProfile);
            const refreshToken = generateRefreshToken(user);

            // Log successful mobile login
            console.log(`[SECURITY] Successful mobile login: ${user.id} - ${user.email}`);

            res.json({
                success: true,
                message: 'Login successful',
                user: mobileProfile,
                token: accessToken,
                refreshToken
            });

        } catch (error) {
            console.error('Mobile login error:', error);
            res.status(500).json({
                error: 'Login failed',
                message: 'An error occurred during mobile login'
            });
        }
    },

    /**
     * Get current user profile
     * GET /api/auth/me
     */
    getMe: async (req, res) => {
        try {
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(404).json({
                    error: 'User not found',
                    message: 'Your account could not be found'
                });
            }

            res.json({
                success: true,
                user
            });

        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                error: 'Failed to fetch profile',
                message: 'An error occurred while fetching your profile'
            });
        }
    },

    /**
     * Change password
     * POST /api/auth/change-password
     */
    changePassword: async (req, res) => {
        try {
            const { old_password, new_password } = req.body;
            const userId = req.user.id;
            const userEmail = req.user.email;

            // Verify old password
            const user = await User.verifyPassword(userEmail, old_password);

            if (!user) {
                return res.status(401).json({
                    error: 'Invalid password',
                    message: 'Current password is incorrect'
                });
            }

            // Update password
            await User.updatePassword(userId, new_password);

            // Log security event
            console.log(`[SECURITY] Password changed for user: ${userId}`);

            res.json({
                success: true,
                message: 'Password changed successfully'
            });

        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                error: 'Failed to change password',
                message: 'An error occurred while changing your password'
            });
        }
    },

    /**
     * Update user profile
     * PATCH /api/auth/profile
     */
    updateProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const updates = req.body;

            // Prevent role/email changes via this endpoint if strictness is needed
            delete updates.role;
            delete updates.password;
            delete updates.id;

            // Update user
            const updatedUser = await User.update(userId, updates);

            if (!updatedUser) {
                return res.status(404).json({
                    error: 'Update failed',
                    message: 'Could not update profile'
                });
            }

            res.json({
                success: true,
                message: 'Profile updated successfully',
                user: updatedUser
            });

        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                error: 'Failed to update profile',
                message: 'An error occurred while updating your profile'
            });
        }
    },

    /**
     * Logout (optional - mainly for client-side token removal)
     * POST /api/auth/logout
     */
    logout: async (req, res) => {
        try {
            // In a stateless JWT system, logout is handled client-side
            // We log the event for auditing
            console.log(`[SECURITY] User logged out: ${req.user ? req.user.id : 'unknown'}`);

            res.json({
                success: true,
                message: 'Logged out successfully'
            });

        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                error: 'Logout failed',
                message: 'An error occurred during logout'
            });
        }
    }
};

module.exports = authController;
