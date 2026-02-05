const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware - JWT token verification
 * Protects routes and provides user context
 */

/**
 * Verify JWT token and attach user to request
 * Returns 401 if no token, 403 if invalid/expired
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Next middleware
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No authentication token provided'
      });
    }

    // Verify token
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) reject(err);
        else resolve(user);
      });
    });

    // 🔒 SECURTY: Fetch latest role from DB to ensure immediate revocation/role change
    // Do not rely solely on the token payload which might be stale
    const { rows } = await require('../config/database').query(
      'SELECT id, role, full_name, email FROM users WHERE id = $1',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: 'User not found',
        message: 'User account no longer exists'
      });
    }

    const user = rows[0];

    // Check if account is active (optional but recommended)
    // if (!user.is_active) ...

    // Attach user data to request (merging token data with live DB data)
    req.user = { ...decoded, ...user };

    next();

  } catch (error) {
    console.error('JWT verification failed:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        error: 'Token expired',
        message: 'Your session has expired. Please login again.'
      });
    }

    return res.status(403).json({
      error: 'Authentication failed',
      message: 'Could not verify authentication token'
    });
  }
};

/**
 * Optional authentication - attach user if token exists, but don't require it
 * Useful for endpoints that have both public and authenticated behavior
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Next middleware
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) reject(err);
        else resolve(user);
      });
    });

    req.user = decoded;
    next();

  } catch (error) {
    // For optional auth, ignore errors and continue as unauthenticated
    req.user = null;
    next();
  }
};

/**
 * Role-based authorization middleware factory
 * Checks if authenticated user has one of the allowed roles
 * Must be used AFTER authenticateToken middleware
 * @param {...string} roles - Allowed roles (e.g., 'project_manager', 'agronomist')
 * @returns {function} Express middleware
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
    }

    if (!roles.includes(req.user.role)) {
      console.warn(`Access denied: User ${req.user.id} (${req.user.role}) attempted to access route requiring roles: ${roles.join(', ')}`);

      return res.status(403).json({
        error: 'Access forbidden',
        message: 'You do not have permission to access this resource',
        requiredRole: roles.length === 1 ? roles[0] : roles
      });
    }

    next();
  };
};

/**
 * Require specific user ID (user can only access their own resources)
 * Checks if req.user.id matches req.params.id or req.body.user_id
 * Project managers bypass this check
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Next middleware
 */
const requireOwnership = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }

  // Project managers can access any resource
  if (req.user.role === 'project_manager') {
    return next();
  }

  const resourceUserId = req.params.id || req.params.userId || req.body.user_id;

  if (resourceUserId && req.user.id.toString() !== resourceUserId.toString()) {
    return res.status(403).json({
      error: 'Access forbidden',
      message: 'You can only access your own resources'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  authorizeRoles,
  requireOwnership
};