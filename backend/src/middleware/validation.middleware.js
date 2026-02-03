const Joi = require('joi');

/**
 * Validation schemas and middleware for authentication endpoints
 * Uses Joi for robust input validation with Rwandan phone format support
 */

// Rwandan phone number pattern: +2507XXXXXXXX
const rwandanPhonePattern = /^\+2507[238]\d{7}$/;

// Custom Joi validation for Rwandan phone
const rwandanPhone = Joi.string()
    .pattern(rwandanPhonePattern)
    .messages({
        'string.pattern.base': 'Phone number must be in Rwandan format: +2507XXXXXXXX (MTN, Airtel, or Airtel-Tigo)'
    });

// Validation Schemas
const schemas = {
    register: Joi.object({
        full_name: Joi.string().min(3).max(100).required()
            .messages({
                'string.min': 'Full name must be at least 3 characters',
                'string.max': 'Full name cannot exceed 100 characters',
                'any.required': 'Full name is required'
            }),

        email: Joi.string().email().required()
            .messages({
                'string.email': 'Please provide a valid email address',
                'any.required': 'Email address is required'
            }),

        phone: rwandanPhone.optional(),

        password: Joi.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            .required()
            .messages({
                'string.min': 'Password must be at least 8 characters',
                'string.pattern.base': 'Password must contain uppercase, lowercase, number and special character',
                'any.required': 'Password is required'
            }),

        role: Joi.string().valid('project_manager', 'agronomist', 'field_facilitator').required()
            .messages({
                'any.only': 'Role must be one of: project_manager, agronomist, field_facilitator',
                'any.required': 'Role is required'
            }),

        language: Joi.string().valid('en', 'rw', 'fr').default('en')
    }),

    login: Joi.object({
        email: Joi.string().email().required()
            .messages({
                'string.email': 'Please provide a valid email address',
                'any.required': 'Email is required'
            }),

        password: Joi.string().required()
            .messages({
                'any.required': 'Password is required'
            })
    }),

    changePassword: Joi.object({
        old_password: Joi.string().required(),
        new_password: Joi.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            .required()
            .messages({
                'string.min': 'New password must be at least 8 characters',
                'string.pattern.base': 'Password must contain uppercase, lowercase, number and special character'
            })
    }),

    updateProfile: Joi.object({
        full_name: Joi.string().min(3).max(100),
        email: Joi.string().email(),
        phone: rwandanPhone,
        language: Joi.string().valid('en', 'rw', 'fr')
    }).min(1)
};

/**
 * Validation middleware factory
 * @param {string} schemaName - Name of the validation schema to use
 * @returns {Function} Express middleware function
 */
const validate = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];

        if (!schema) {
            console.error(`Validation schema '${schemaName}' not found`);
            return res.status(500).json({ error: 'Validation configuration error' });
        }

        const { error, value } = schema.validate(req.body, {
            abortEarly: false, // Return all errors, not just the first one
            stripUnknown: true // Remove unknown fields
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                error: 'Validation failed',
                details: errors
            });
        }

        // Replace req.body with validated and sanitized data
        req.body = value;
        next();
    };
};

// Export individual validators
module.exports = {
    validate,
    validateRegistration: validate('register'),
    validateLogin: validate('login'),
    validateChangePassword: validate('changePassword'),
    validateUpdateProfile: validate('updateProfile'),
    schemas // Export schemas for testing
};
