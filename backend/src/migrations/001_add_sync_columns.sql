-- Migration: Add Sync Columns and Farmer Role Support
-- Purpose: Enable mobile offline-first sync and farmer authentication
-- Date: 2026-02-13

-- ========================================
-- ADD SYNC COLUMNS TO MAIN TABLES
-- ========================================

-- Add sync columns to farmers table
ALTER TABLE farmers 
ADD COLUMN IF NOT EXISTS remote_id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS sync_status VARCHAR(20) DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict')),
ADD COLUMN IF NOT EXISTS local_updated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS server_updated_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 0 CHECK (trust_score BETWEEN 0 AND 100);

-- Add sync columns to sales table
ALTER TABLE sales
ADD COLUMN IF NOT EXISTS remote_id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS sync_status VARCHAR(20) DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict')),
ADD COLUMN IF NOT EXISTS local_updated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS server_updated_at TIMESTAMP DEFAULT NOW();

-- Add sync columns to input_invoices table
ALTER TABLE input_invoices
ADD COLUMN IF NOT EXISTS remote_id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS sync_status VARCHAR(20) DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict')),
ADD COLUMN IF NOT EXISTS local_updated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS server_updated_at TIMESTAMP DEFAULT NOW();

-- Add sync columns to compost_workdays table
ALTER TABLE compost_workdays
ADD COLUMN IF NOT EXISTS remote_id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS sync_status VARCHAR(20) DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict')),
ADD COLUMN IF NOT EXISTS local_updated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS server_updated_at TIMESTAMP DEFAULT NOW();

-- Add sync columns to training_sessions table
ALTER TABLE training_sessions
ADD COLUMN IF NOT EXISTS remote_id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS sync_status VARCHAR(20) DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict')),
ADD COLUMN IF NOT EXISTS local_updated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS server_updated_at TIMESTAMP DEFAULT NOW();

-- ========================================
-- CREATE INDEXES FOR SYNC QUERIES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_farmers_remote_id ON farmers(remote_id);
CREATE INDEX IF NOT EXISTS idx_farmers_sync_status ON farmers(sync_status);
CREATE INDEX IF NOT EXISTS idx_farmers_trust_score ON farmers(trust_score);

CREATE INDEX IF NOT EXISTS idx_sales_remote_id ON sales(remote_id);
CREATE INDEX IF NOT EXISTS idx_sales_sync_status ON sales(sync_status);

CREATE INDEX IF NOT EXISTS idx_input_invoices_remote_id ON input_invoices(remote_id);
CREATE INDEX IF NOT EXISTS idx_input_invoices_sync_status ON input_invoices(sync_status);

CREATE INDEX IF NOT EXISTS idx_compost_workdays_remote_id ON compost_workdays(remote_id);
CREATE INDEX IF NOT EXISTS idx_compost_workdays_sync_status ON compost_workdays(sync_status);

CREATE INDEX IF NOT EXISTS idx_training_sessions_remote_id ON training_sessions(remote_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_sync_status ON training_sessions(sync_status);

-- ========================================
-- ADD FARMER ROLE SUPPORT TO USERS TABLE
-- ========================================

-- Add farmer role to the role enum (if using enum type)
-- Note: PostgreSQL doesn't support adding values to CHECK constraints directly
-- We need to drop and recreate the constraint

-- First, check what roles exist
DO $$
BEGIN
    -- Add user_id column to farmers table to link with users
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'farmers' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE farmers ADD COLUMN user_id INTEGER REFERENCES users(id);
        CREATE INDEX idx_farmers_user_id ON farmers(user_id);
    END IF;
END $$;

-- Update role constraint in users table to include 'farmer' role
-- This assumes the users table has a role column with CHECK constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('project_manager', 'agronomist', 'field_facilitator', 'buyer', 'farmer'));

-- ========================================
-- CREATE NEW TABLES FOR MOBILE FEATURES
-- ========================================

-- Training Progress tracking for farmers
CREATE TABLE IF NOT EXISTS training_progress (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
    training_id INTEGER REFERENCES training_sessions(id) ON DELETE CASCADE,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
    quiz_score INTEGER CHECK (quiz_score BETWEEN 0 AND 100),
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    remote_id UUID DEFAULT gen_random_uuid(),
    sync_status VARCHAR(20) DEFAULT 'synced',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_training_progress_farmer ON training_progress(farmer_id);
CREATE INDEX idx_training_progress_training ON training_progress(training_id);
CREATE INDEX idx_training_progress_remote_id ON training_progress(remote_id);

-- Notifications for personalized alerts
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general' CHECK (type IN ('general', 'training', 'vsla', 'market', 'administrative', 'weather')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    action_url VARCHAR(500),
    scheduled_for TIMESTAMP,
    remote_id UUID DEFAULT gen_random_uuid(),
    sync_status VARCHAR(20) DEFAULT 'synced',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_farmer ON notifications(farmer_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for);

-- Market Prices for offline caching
CREATE TABLE IF NOT EXISTS market_prices (
    id SERIAL PRIMARY KEY,
    crop_type VARCHAR(50) NOT NULL,
    quality_grade VARCHAR(20) CHECK (quality_grade IN ('premium', 'grade_a', 'grade_b', 'standard')),
    price_per_kg DECIMAL(10,2) NOT NULL,
    market_location VARCHAR(100),
    price_date DATE DEFAULT CURRENT_DATE,
    trend VARCHAR(20) CHECK (trend IN ('rising', 'stable', 'falling')),
    demand_level VARCHAR(20) CHECK (demand_level IN ('low', 'moderate', 'high', 'very_high')),
    remote_id UUID DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_market_prices_crop ON market_prices(crop_type);
CREATE INDEX idx_market_prices_date ON market_prices(price_date);
CREATE INDEX idx_market_prices_grade ON market_prices(quality_grade);

-- Trust Score History for tracking evolution
CREATE TABLE IF NOT EXISTS trust_score_history (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
    trust_score INTEGER NOT NULL CHECK (trust_score BETWEEN 0 AND 100),
    vsla_score DECIMAL(5,2),
    repayment_score DECIMAL(5,2),
    agronomic_score DECIMAL(5,2),
    calculation_date DATE DEFAULT CURRENT_DATE,
    remote_id UUID DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_trust_score_history_farmer ON trust_score_history(farmer_id);
CREATE INDEX idx_trust_score_history_date ON trust_score_history(calculation_date);

-- ========================================
-- AUTO-UPDATE TRIGGERS FOR NEW TABLES
-- ========================================

CREATE TRIGGER update_training_progress_updated_at BEFORE UPDATE ON training_progress
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_market_prices_updated_at BEFORE UPDATE ON market_prices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON COLUMN farmers.remote_id IS 'UUID for mobile app synchronization';
COMMENT ON COLUMN farmers.sync_status IS 'Synchronization status: synced, pending, or conflict';
COMMENT ON COLUMN farmers.trust_score IS 'Calculated trust score (0-100) for financial qualification';
COMMENT ON TABLE training_progress IS 'Tracks farmer progress through training modules';
COMMENT ON TABLE notifications IS 'Stores notifications for farmers and staff';
COMMENT ON TABLE market_prices IS 'Current market prices for offline mobile access';
COMMENT ON TABLE trust_score_history IS 'Historical tracking of farmer trust scores';

-- Success message
SELECT 'Migration 001: Sync columns and farmer role support applied successfully' AS status;
