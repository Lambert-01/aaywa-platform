/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts routes based on user roles
 */

const roleGuard = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Please log in to access this resource'
            });
        }

        const userRole = req.user.role;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                error: 'Access denied',
                message: `This resource requires one of these roles: ${allowedRoles.join(', ')}`,
                userRole
            });
        }

        next();
    };
};

/**
 * Check if user owns the resource or has admin privileges
 */
const ownerOrAdmin = (resourceUserIdField = 'user_id') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const isAdmin = ['manager', 'agronomist'].includes(req.user.role);
        const isOwner = req.body[resourceUserIdField] === req.user.id ||
            req.params[resourceUserIdField] === req.user.id;

        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                error: 'Access denied',
                message: 'You can only access your own resources'
            });
        }

        next();
    };
};

/**
 * Middleware to attach farmer_id from user context
 */
const attachFarmerId = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const pool = require('../config/database');
        const result = await pool.query(
            'SELECT id FROM farmers WHERE user_id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Farmer profile not found',
                message: 'User is not registered as a farmer'
            });
        }

        req.farmerId = result.rows[0].id;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    roleGuard,
    ownerOrAdmin,
    attachFarmerId
};
