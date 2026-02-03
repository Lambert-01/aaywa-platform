const AfricasTalking = require('africastalking');

// Initialize Africa's Talking client
const credentials = {
    apiKey: process.env.AFRICASTALKING_API_KEY || 'sandbox',
    username: process.env.AFRICASTALKING_USERNAME || 'sandbox'
};

const africastalking = AfricasTalking(credentials);
const sms = africastalking.SMS;

/**
 * SMS Service - Send SMS messages via Africa's Talking API
 * Handles OTP delivery and transactional messages
 */
class SMSService {
    /**
     * Send OTP code via SMS
     * @param {string} phone - Phone number in format +2507XXXXXXXX
     * @param {string} otpCode - 6-digit OTP code
     * @returns {Promise<{success: boolean, message: string}>}
     */
    static async sendOTP(phone, otpCode) {
        const message = `Your AAYWA verification code is: ${otpCode}\n\nThis code expires in 5 minutes. Do not share this code with anyone.`;

        return await this.sendSMS(phone, message, 'OTP');
    }

    /**
     * Send welcome SMS to new user
     * @param {string} phone - Phone number
     * @param {string} name - User's name
     * @returns {Promise<{success: boolean, message: string}>}
     */
    static async sendWelcome(phone, name) {
        const message = `Welcome to AAYWA & PARTNERS, ${name}! Your account has been created successfully. Login to access your dashboard.`;

        return await this.sendSMS(phone, message, 'WELCOME');
    }

    /**
     * Core SMS sending method
     * @param {string} phone - Phone number
     * @param {string} message - Message content
     * @param {string} type - Message type for logging (OTP, WELCOME, etc.)
     * @returns {Promise<{success: boolean, message: string, messageId?: string}>}
     */
    static async sendSMS(phone, message, type = 'SMS') {
        try {
            // In development mode, log to console instead of sending real SMS
            if (process.env.NODE_ENV === 'development') {
                console.log('\n========================================');
                console.log(`📱 SMS [${type}] TO: ${phone}`);
                console.log(`📝 MESSAGE: ${message}`);
                console.log('========================================\n');

                return {
                    success: true,
                    message: 'SMS logged to console (development mode)',
                    messageId: 'dev_' + Date.now()
                };
            }

            // Production: Send via Africa's Talking
            const options = {
                to: [phone],
                message: message,
                from: process.env.AFRICASTALKING_SENDER_ID || null // Optional sender ID
            };

            const response = await sms.send(options);

            // Check if message was sent successfully
            if (response.SMSMessageData.Recipients[0].status === 'Success') {
                return {
                    success: true,
                    message: 'SMS sent successfully',
                    messageId: response.SMSMessageData.Recipients[0].messageId
                };
            } else {
                console.error('Africa\'s Talking SMS failed:', response.SMSMessageData.Recipients[0]);
                return {
                    success: false,
                    message: 'Failed to send SMS: ' + response.SMSMessageData.Recipients[0].status
                };
            }
        } catch (error) {
            console.error('SMS Service Error:', error);

            // In development, still return success so testing isn't blocked
            if (process.env.NODE_ENV === 'development') {
                console.log('⚠️ SMS failed but continuing in development mode');
                return {
                    success: true,
                    message: 'SMS error ignored in development mode'
                };
            }

            return {
                success: false,
                message: 'Failed to send SMS: ' + error.message
            };
        }
    }

    /**
     * Validate Rwandan phone number format
     * @param {string} phone - Phone number
     * @returns {boolean} True if valid Rwandan format
     */
    static isValidRwandanPhone(phone) {
        // Rwandan format: +2507XXXXXXXX (total 13 chars)
        // Accepts: +250788123456 or +250738123456 (MTN, Airtel)
        const rwandanPhoneRegex = /^\+2507[238]\d{7}$/;
        return rwandanPhoneRegex.test(phone);
    }

    /**
     * Format phone number to Rwandan standard
     * @param {string} phone - Phone number (accepts various formats)
     * @returns {string|null} Formatted phone or null if invalid
     */
    static formatRwandanPhone(phone) {
        // Remove all spaces and dashes
        let cleaned = phone.replace(/[\s-]/g, '');

        // If starts with 0, replace with +250
        if (cleaned.startsWith('0')) {
            cleaned = '+250' + cleaned.substring(1);
        }

        // If starts with 250 without +, add it
        if (cleaned.startsWith('250') && !cleaned.startsWith('+')) {
            cleaned = '+' + cleaned;
        }

        // Validate and return
        return this.isValidRwandanPhone(cleaned) ? cleaned : null;
    }
}

module.exports = SMSService;
