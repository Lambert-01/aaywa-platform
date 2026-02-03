-- Migration: Create OTP codes table for phone authentication
-- Date: 2026-01-31
-- Description: Store OTP codes with expiration, attempt tracking, and automatic cleanup

-- Drop table if exists (for development only)
DROP TABLE IF EXISTS otp_codes CASCADE;

-- Create OTP codes table
CREATE TABLE otp_codes (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP
);

-- Create indexes for fast lookup
CREATE INDEX idx_otp_phone ON otp_codes(phone) WHERE is_used = false;
CREATE INDEX idx_otp_expires ON otp_codes(expires_at) WHERE is_used = false;
CREATE INDEX idx_otp_created_at ON otp_codes(created_at);

-- Add check constraint
ALTER TABLE otp_codes ADD CONSTRAINT check_otp_attempts CHECK (attempts >= 0 AND attempts <= 10);

-- Function to clean up expired OTPs (call via cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM otp_codes 
  WHERE expires_at < NOW() - INTERVAL '1 hour' OR created_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE otp_codes IS 'One-time passwords for phone authentication with automatic expiration';
COMMENT ON COLUMN otp_codes.attempts IS 'Number of failed verification attempts (max 3 before lockout)';
COMMENT ON COLUMN otp_codes.expires_at IS 'OTP expires 5 minutes after creation';
COMMENT ON FUNCTION cleanup_expired_otps IS 'Run via cron job to delete old OTP records';
