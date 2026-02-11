-- Migration: Add preferences JSONB to users table
-- Date: 2026-02-11

ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Update default language from 'rw' to 'en'
ALTER TABLE users ALTER COLUMN language SET DEFAULT 'en';

-- Update existing users with 'rw' to 'en'
UPDATE users SET language = 'en' WHERE language = 'rw';

-- Update comment
COMMENT ON COLUMN users.preferences IS 'General user preferences (theme, notification settings, currency, etc.)';
