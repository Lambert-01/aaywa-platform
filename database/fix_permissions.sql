-- Fix Permissions for AAYWA Platform
-- Run this as 'postgres' superuser

-- 1. Grant usage on schema
GRANT USAGE ON SCHEMA public TO aaywa_user;
GRANT CREATE ON SCHEMA public TO aaywa_user;

-- 2. Grant access to all existing tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO aaywa_user;

-- 3. Grant access to all sequences (for IDs)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO aaywa_user;

-- 4. Change ownership of new compost tables to aaywa_user (to prevent future issues)
ALTER TABLE compost_batches OWNER TO aaywa_user;
ALTER TABLE compost_feedstock_items OWNER TO aaywa_user;
ALTER TABLE compost_sales OWNER TO aaywa_user;
ALTER TABLE compost_workdays OWNER TO aaywa_user;

-- 5. Change ownership of other key tables just in case
ALTER TABLE users OWNER TO aaywa_user;
ALTER TABLE cohorts OWNER TO aaywa_user;
