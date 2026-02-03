-- Add new columns to cohorts table to support enhanced creation form
ALTER TABLE cohorts
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS intercrops TEXT[],
ADD COLUMN IF NOT EXISTS target_area NUMERIC,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS childcare_support BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS repayment_threshold NUMERIC DEFAULT 85,
ADD COLUMN IF NOT EXISTS seed_capital NUMERIC,
ADD COLUMN IF NOT EXISTS profit_sharing_ratio TEXT DEFAULT '50/50',
ADD COLUMN IF NOT EXISTS warehouse_assign TEXT, -- Using text for flexibility or ID if table exists
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
