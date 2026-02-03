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
            role: user.role
        },
        // Ensure we use a string even if env is missing (fallback)
        process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod',
        { expiresIn: parseInt(expiresIn) }
    );
};

const authController = {
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

            // Verify credentials (method checks email first)
            const user = await User.verifyPassword(email, password);

            if (!user) {
                // Generic error message for security
                return res.status(401).json({
                    error: 'Authentication failed',
                    message: 'Invalid email or password'
                });
            }

            if (!user.is_active) {
                return res.status(403).json({
                    error: 'Account disabled',
                    message: 'Your account has been deactivated. Please contact an administrator.'
                });
            }

            // Update last login timestamp
            await User.updateLastLogin(user.id);

            // Generate JWT token
            const token = generateToken(user);

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
                    last_login: new Date()
                },
                token
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
