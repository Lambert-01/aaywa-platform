const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, phone: user.phone, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const userController = {
  // Register new user (Public/Self registration - minimal)
  register: async (req, res) => {
    try {
      const { phone, full_name, role, language } = req.body;

      // Check if user exists
      const existingUser = await User.findByPhone(phone);
      if (existingUser) {
        return res.status(400).json({ error: 'User with this phone number already exists' });
      }

      // Create user
      const user = await User.create({ phone, full_name, role, language });
      const token = generateToken(user);

      res.status(201).json({
        message: 'User registered successfully',
        user,
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  },

  // Login with phone + password
  login: async (req, res) => {
    try {
      const { phone, password } = req.body;

      const user = await User.findByPhone(phone);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken(user);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          phone: user.phone,
          full_name: user.full_name,
          role: user.role,
          language: user.language
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  },

  // Get current user profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  },

  // ========================================
  // USER MANAGEMENT (Admin Only)
  // ========================================

  // GET /api/users - List all users
  getAllUsers: async (req, res) => {
    try {
      const db = require('../config/database');
      const result = await db.query(`
        SELECT id, full_name, email, role, is_active, created_at
        FROM users
        ORDER BY created_at DESC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  },

  // POST /api/users - Create new user
  createUser: async (req, res) => {
    try {
      const { full_name, email, password, role } = req.body;

      // Validate role
      const allowedRoles = ['project_manager', 'agronomist', 'field_facilitator'];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role specified' });
      }

      // Check if email exists
      const db = require('../config/database');
      const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const result = await db.query(
        'INSERT INTO users (full_name, email, password_hash, role, is_active) VALUES ($1, $2, $3, $4, true) RETURNING id, full_name, email, role',
        [full_name, email, passwordHash, role]
      );

      res.status(201).json({
        message: 'User created successfully',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  },

  // PATCH /api/users/:id - Update user
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { full_name, role, is_active } = req.body;

      const db = require('../config/database');

      const updates = [];
      const values = [];
      let paramCount = 1;

      if (full_name !== undefined) {
        updates.push(`full_name = $${paramCount++}`);
        values.push(full_name);
      }
      if (role !== undefined) {
        updates.push(`role = $${paramCount++}`);
        values.push(role);
      }
      if (is_active !== undefined) {
        updates.push(`is_active = $${paramCount++}`);
        values.push(is_active);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);

      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}`;
      await db.query(query, values);

      res.json({ message: 'User updated successfully' });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  },

  // DELETE /api/users/:id - Delete user
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      // Prevent deleting yourself
      if (req.user.id === parseInt(id)) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      const db = require('../config/database');
      await db.query('DELETE FROM users WHERE id = $1', [id]);

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  },

  // ========================================
  // REGISTRATION APPROVAL WORKFLOW
  // ========================================

  // POST /api/users/register - Public registration request
  registerRequest: async (req, res) => {
    try {
      const { full_name, email, phone, requested_role, message } = req.body;

      // Validate inputs
      if (!full_name || !email) {
        return res.status(400).json({ error: 'Full name and email are required' });
      }

      // Validate requested role
      const allowedRoles = ['field_facilitator', 'agronomist', 'project_manager'];
      if (requested_role && !allowedRoles.includes(requested_role)) {
        return res.status(400).json({ error: 'Invalid role requested' });
      }

      const db = require('../config/database');

      // Check if email already exists
      const existing = await db.query('SELECT id, registration_status FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        const existingUser = existing.rows[0];
        if (existingUser.registration_status === 'pending') {
          return res.status(409).json({ error: 'A registration request with this email is already pending' });
        }
        return res.status(409).json({ error: 'This email is already registered' });
      }

      // Create pending user (no password yet)
      const result = await db.query(`
        INSERT INTO users (
          full_name, 
          email, 
          phone, 
          requested_role, 
          registration_status, 
          registration_notes,
          registration_date,
          is_active
        ) VALUES ($1, $2, $3, $4, 'pending', $5, NOW(), false)
        RETURNING id, full_name, email, requested_role, registration_date
      `, [full_name, email, phone || null, requested_role || 'field_facilitator', message || null]);

      console.log(`[REGISTRATION] New registration request: ${email} - ${requested_role}`);

      res.status(201).json({
        success: true,
        message: 'Registration request submitted successfully. An administrator will review your request.',
        registration: result.rows[0]
      });
    } catch (error) {
      console.error('Error in registration request:', error);
      res.status(500).json({ error: 'Failed to submit registration request' });
    }
  },

  // GET /api/users/pending - Get pending registration requests (Admin only)
  getPendingUsers: async (req, res) => {
    try {
      const db = require('../config/database');
      const result = await db.query(`
        SELECT 
          id, 
          full_name, 
          email, 
          phone, 
          requested_role, 
          registration_notes,
          registration_date,
          created_at
        FROM users
        WHERE registration_status = 'pending'
        ORDER BY registration_date DESC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      res.status(500).json({ error: 'Failed to fetch pending users' });
    }
  },

  // POST /api/users/:id/approve - Approve registration (Admin only)
  approveUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { password, role } = req.body;

      if (!password) {
        return res.status(400).json({ error: 'Password is required to approve user' });
      }

      // Validate role
      const allowedRoles = ['project_manager', 'agronomist', 'field_facilitator'];
      if (role && !allowedRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role specified' });
      }

      const db = require('../config/database');

      // Check if user exists and is pending
      const userCheck = await db.query(
        'SELECT id, registration_status, requested_role FROM users WHERE id = $1',
        [id]
      );

      if (userCheck.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userCheck.rows[0];
      if (user.registration_status !== 'pending') {
        return res.status(400).json({ error: 'User is not pending approval' });
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Approve user
      const finalRole = role || user.requested_role || 'field_facilitator';
      await db.query(`
        UPDATE users 
        SET 
          password_hash = $1,
          role = $2,
          registration_status = 'approved',
          is_active = true,
          approved_by = $3,
          approved_at = NOW()
        WHERE id = $4
      `, [passwordHash, finalRole, req.user.id, id]);

      console.log(`[SECURITY] User approved: ID ${id} by admin ${req.user.id}`);

      res.json({
        success: true,
        message: 'User approved successfully',
        user: { id, role: finalRole }
      });
    } catch (error) {
      console.error('Error approving user:', error);
      res.status(500).json({ error: 'Failed to approve user' });
    }
  },

  // POST /api/users/:id/reject - Reject registration (Admin only)
  rejectUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const db = require('../config/database');

      // Check if user exists and is pending
      const userCheck = await db.query(
        'SELECT id, registration_status FROM users WHERE id = $1',
        [id]
      );

      if (userCheck.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userCheck.rows[0];
      if (user.registration_status !== 'pending') {
        return res.status(400).json({ error: 'User is not pending approval' });
      }

      // Reject user (update status, don't delete)
      await db.query(`
        UPDATE users 
        SET 
          registration_status = 'rejected',
          registration_notes = $1,
          approved_by = $2,
          approved_at = NOW()
        WHERE id = $3
      `, [reason || 'Rejected by administrator', req.user.id, id]);

      console.log(`[SECURITY] User rejected: ID ${id} by admin ${req.user.id}`);

      res.json({
        success: true,
        message: 'Registration request rejected'
      });
    } catch (error) {
      console.error('Error rejecting user:', error);
      res.status(500).json({ error: 'Failed to reject user' });
    }
  }
};

module.exports = userController;