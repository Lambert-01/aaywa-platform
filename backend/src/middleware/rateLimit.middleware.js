const rateLimit = require('express-rate-limit');

/**
 * Rate limiting middleware for authentication endpoints
 * Prevents brute force attacks and abuse
 */

// Rate limit for OTP requests (Deprecated, kept for reference but unused)
const otpRequestLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limit for OTP verification (Deprecated)
const otpVerifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limit for registration - 10 per hour per IP
const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: {
        error: 'Too many registration attempts. Please try again later.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Registration rate limit exceeded',
            message: 'Too many accounts created from this IP. Please try again in 1 hour.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

// General API rate limiter - 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Too many requests. Please slow down.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Strict limiter for sensitive operations - 20 per 15 minutes
const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Rate limit exceeded',
            message: 'You are making requests too quickly. Please wait a few minutes.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

// Login limiter - 5 attempts per minute
const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: {
        error: 'Too many login attempts',
        message: 'Please wait a minute before trying again.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    otpRequestLimiter,
    otpVerifyLimiter,
    registrationLimiter,
    generalLimiter,
    strictLimiter,
    loginLimiter
};
