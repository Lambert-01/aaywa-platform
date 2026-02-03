const pool = require('../config/database');

/**
 * OTP Model - Manages one-time passwords for phone authentication
 * Uses PostgreSQL for production-ready OTP storage with expiration
 */
class OTP {
    /**
     * Create and store a new OTP for a phone number
     * @param {string} phone - Phone number in format +2507XXXXXXXX
     * @param {string} otpCode - 6-digit OTP code
     * @param {number} expiryMinutes - Minutes until OTP expires (default: 5)
     * @returns {Promise<object>} Created OTP record
     */
    static async create(phone, otpCode, expiryMinutes = 5) {
        try {
            // Delete any existing unused OTPs for this phone
            await pool.query(
                'DELETE FROM otp_codes WHERE phone = $1 AND is_used = false',
                [phone]
            );

            // Create new OTP
            const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
            const query = `
        INSERT INTO otp_codes (phone, otp_code, expires_at)
        VALUES ($1, $2, $3)
        RETURNING id, phone, otp_code, attempts, created_at, expires_at
      `;
            const result = await pool.query(query, [phone, otpCode, expiresAt]);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating OTP:', error);
            throw new Error('Failed to create OTP');
        }
    }

    /**
     * Verify OTP code for a phone number
     * @param {string} phone - Phone number
     * @param {string} otpCode - OTP code to verify
     * @returns {Promise<{valid: boolean, locked: boolean, message: string}>}
     */
    static async verify(phone, otpCode) {
        try {
            // Find the most recent unused OTP for this phone
            const query = `
        SELECT id, otp_code, attempts, expires_at
        FROM otp_codes
        WHERE phone = $1 AND is_used = false
        ORDER BY created_at DESC
        LIMIT 1
      `;
            const result = await pool.query(query, [phone]);

            if (result.rows.length === 0) {
                return { valid: false, locked: false, message: 'No OTP found. Please request a new one.' };
            }

            const otp = result.rows[0];

            // Check if OTP has expired
            if (new Date() > new Date(otp.expires_at)) {
                return { valid: false, locked: false, message: 'OTP has expired. Please request a new one.' };
            }

            // Check if too many attempts (lockout after 3 failed attempts)
            if (otp.attempts >= 3) {
                return { valid: false, locked: true, message: 'Too many failed attempts. OTP has been locked.' };
            }

            // Verify OTP code
            if (otp.otp_code !== otpCode) {
                // Increment attempts
                await pool.query(
                    'UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1',
                    [otp.id]
                );

                const remainingAttempts = 3 - (otp.attempts + 1);
                if (remainingAttempts <= 0) {
                    return { valid: false, locked: true, message: 'Invalid OTP. Account locked due to too many attempts.' };
                }

                return {
                    valid: false,
                    locked: false,
                    message: `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`
                };
            }

            // OTP is valid - mark as used
            await pool.query(
                'UPDATE otp_codes SET is_used = true, used_at = NOW() WHERE id = $1',
                [otp.id]
            );

            return { valid: true, locked: false, message: 'OTP verified successfully' };
        } catch (error) {
            console.error('Error verifying OTP:', error);
            throw new Error('Failed to verify OTP');
        }
    }

    /**
     * Check if phone number has recently requested an OTP (rate limiting)
     * @param {string} phone - Phone number
     * @param {number} cooldownSeconds - Minimum seconds between OTP requests (default: 60)
     * @returns {Promise<{allowed: boolean, remainingSeconds: number}>}
     */
    static async canRequestOTP(phone, cooldownSeconds = 60) {
        try {
            const query = `
        SELECT created_at
        FROM otp_codes
        WHERE phone = $1
        ORDER BY created_at DESC
        LIMIT 1
      `;
            const result = await pool.query(query, [phone]);

            if (result.rows.length === 0) {
                return { allowed: true, remainingSeconds: 0 };
            }

            const lastRequest = new Date(result.rows[0].created_at);
            const secondsSinceLastRequest = (Date.now() - lastRequest.getTime()) / 1000;

            if (secondsSinceLastRequest < cooldownSeconds) {
                const remainingSeconds = Math.ceil(cooldownSeconds - secondsSinceLastRequest);
                return { allowed: false, remainingSeconds };
            }

            return { allowed: true, remainingSeconds: 0 };
        } catch (error) {
            console.error('Error checking OTP request cooldown:', error);
            return { allowed: true, remainingSeconds: 0 }; // Fail open to not block users
        }
    }

    /**
     * Clean up expired OTPs (run via cron job)
     * @returns {Promise<number>} Number of deleted records
     */
    static async cleanupExpired() {
        try {
            const result = await pool.query('SELECT cleanup_expired_otps()');
            return result.rows[0].cleanup_expired_otps;
        } catch (error) {
            console.error('Error cleaning up OTPs:', error);
            return 0;
        }
    }
}

module.exports = OTP;
