const pool = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * User Model - Manages user accounts and authentication
 * Uses bcrypt for password hashing with configurable salt rounds
 */
class User {
  /**
   * Create a new user with hashed password
   * @param {object} userData - User data {phone, full_name, email, password, role, language}
   * @returns {Promise<object>} Created user (without password_hash)
   */
  static async create(userData) {
    const { phone, full_name, email, password, role, language } = userData;

    // Hash password with bcrypt (salt rounds from env or default 12)
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (phone, full_name, email, password_hash, role, language, preferences)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, phone, full_name, email, role, language, preferences, is_active, created_at
    `;
    const values = [phone, full_name, email || null, passwordHash, role, language || 'en', userData.preferences || {}];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Find user by email (includes password_hash for authentication)
   * @param {string} email - User email
   * @returns {Promise<object|undefined>} User object with password_hash
   */
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  /**
   * Find user by phone number (includes password_hash for authentication)
   * @param {string} phone - Phone number
   * @returns {Promise<object|undefined>} User object with password_hash
   */
  static async findByPhone(phone) {
    const query = 'SELECT * FROM users WHERE phone = $1';
    const result = await pool.query(query, [phone]);
    return result.rows[0];
  }

  /**
   * Find user by ID (excludes password_hash)
   * @param {number} id - User ID
   * @returns {Promise<object|undefined>} User object without password_hash
   */
  static async findById(id) {
    const query = `
      SELECT id, phone, full_name, email, role, language, preferences, is_active, created_at, last_login 
      FROM users 
      WHERE id = $1 AND is_active = true
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Get all users (excludes password_hash)
   * @param {object} filters - Optional filters {role, is_active}
   * @returns {Promise<array>} Array of user objects
   */
  static async getAll(filters = {}) {
    let query = `
      SELECT id, phone, full_name, email, role, language, is_active, created_at, last_login
      FROM users
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (filters.role) {
      query += ` AND role = $${paramIndex}`;
      values.push(filters.role);
      paramIndex++;
    }

    if (filters.is_active !== undefined) {
      query += ` AND is_active = $${paramIndex}`;
      values.push(filters.is_active);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Update user profile data
   * @param {number} id - User ID
   * @param {object} updateData - Fields to update {full_name, email, language, role, phone, location}
   * @returns {Promise<object|null>} Updated user or null if not found
   */
  static async update(id, updateData) {
    const allowedFields = ['full_name', 'email', 'language', 'role', 'phone', 'preferences'];
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(updateData[key]);
        paramIndex++;
      }
    });

    if (fields.length === 0) return null;

    const query = `
      UPDATE users 
      SET ${fields.join(', ')} 
      WHERE id = $${paramIndex} AND is_active = true
      RETURNING id, phone, full_name, email, role, language, created_at
    `;
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Update user password
   * @param {number} id - User ID
   * @param {string} newPassword - New password (plain text, will be hashed)
   * @returns {Promise<boolean>} True if successful
   */
  static async updatePassword(id, newPassword) {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    const query = 'UPDATE users SET password_hash = $1 WHERE id = $2 AND is_active = true';
    const result = await pool.query(query, [passwordHash, id]);
    return result.rowCount > 0;
  }

  /**
   * Update last login timestamp
   * @param {number} id - User ID
   * @returns {Promise<void>}
   */
  static async updateLastLogin(id) {
    const query = 'UPDATE users SET last_login = NOW() WHERE id = $1';
    await pool.query(query, [id]);
  }

  /**
   * Soft delete user (set is_active to false)
   * @param {number} id - User ID
   * @returns {Promise<object|null>} Deactivated user or null
   */
  static async deactivate(id) {
    const query = `
      UPDATE users 
      SET is_active = false 
      WHERE id = $1 
      RETURNING id, phone, full_name, role
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Hard delete user (permanent removal)
   * @param {number} id - User ID
   * @returns {Promise<object|null>} Deleted user or null
   */
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id, phone, full_name';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Verify password for a user
   * @param {string} identifier - Phone number or Email
   * @param {string} password - Input password
   * @returns {Promise<object|null>} User object (without password) if valid, null otherwise
   */
  static async verifyPassword(identifier, password) {
    // Try to find by email first, then phone
    let user = await this.findByEmail(identifier);
    if (!user) {
      user = await this.findByPhone(identifier);
    }

    if (!user || !user.password_hash) return null;

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return null;

    // Return user without password_hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Check if email already exists
   * @param {string} email - Email address
   * @returns {Promise<boolean>} True if exists
   */
  static async emailExists(email) {
    if (!email) return false;
    const query = 'SELECT id FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows.length > 0;
  }
}

module.exports = User;