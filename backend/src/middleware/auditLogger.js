const fs = require('fs');
const path = require('path');

// Ensure log directory exists
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
    try {
        fs.mkdirSync(logDir, { recursive: true });
    } catch (e) {
        console.error('Failed to create log directory:', e);
    }
}

/**
 * Audit Logger Middleware
 * Logs sensitive data access and modifications
 */
const auditLogger = (action) => {
    return (req, res, next) => {
        // Capture original end function
        const originalEnd = res.end;

        // Intercept response end
        res.end = function (chunk, encoding) {
            // Restore original end
            res.end = originalEnd;
            res.end(chunk, encoding);

            // Only log if user is authenticated
            if (req.user) {
                const logEntry = {
                    timestamp: new Date().toISOString(),
                    user_id: req.user.id,
                    role: req.user.role,
                    action: action,
                    method: req.method,
                    path: req.path,
                    ip: req.ip,
                    status: res.statusCode,
                    user_agent: req.get('user-agent')
                };

                // Write to audit log file
                const logFile = path.join(logDir, `audit-${new Date().toISOString().split('T')[0]}.log`);
                const logLine = JSON.stringify(logEntry) + '\n';

                try {
                    fs.appendFile(logFile, logLine, (err) => {
                        if (err) console.error('Failed to write to audit log:', err);
                    });
                } catch (e) {
                    console.error('Audit logging error:', e);
                }
            }
        };

        next();
    };
};

module.exports = auditLogger;
