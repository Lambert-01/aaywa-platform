-- =====================================================
-- Project AAYWA - Complete Database Schema
-- PostgreSQL 15+ with PostGIS Extension
-- =====================================================

-- Enable PostGIS Extension for Geospatial Data
CREATE EXTENSION IF NOT EXISTS postgis;

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('farmer', 'champion', 'vsla_officer', 'facilitator', 'agronomist', 'manager', 'buyer')) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- COHORTS & FARMERS
-- =====================================================

CREATE TABLE cohorts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(200),
  boundary_coordinates GEOMETRY(POLYGON, 4326),
  start_date DATE,
  total_members INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE farmers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  cohort_id INTEGER REFERENCES cohorts(id),
  national_id VARCHAR(16),
  date_of_birth DATE,
  address TEXT,
  farm_location GEOMETRY(POINT, 4326),
  farm_size_hectares DECIMAL(10,2),
  is_champion BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_farmers_user ON farmers(user_id);
CREATE INDEX idx_farmers_cohort ON farmers(cohort_id);

-- =====================================================
-- VSLA (Village Savings & Loan Associations)
-- =====================================================

CREATE TABLE vsla_groups (
  id SERIAL PRIMARY KEY,
  cohort_id INTEGER REFERENCES cohorts(id),
  name VARCHAR(100) NOT NULL,
  seed_capital DECIMAL(10,2) DEFAULT 12000.00, -- €10/member * 20 members * ~60 RWF/EUR
  formation_date DATE DEFAULT CURRENT_DATE,
  meeting_frequency VARCHAR(20) DEFAULT 'weekly',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vsla_members (
  id SERIAL PRIMARY KEY,
  vsla_id INTEGER REFERENCES vsla_groups(id) ON DELETE CASCADE,
  farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
  role VARCHAR(30) CHECK (role IN ('member', 'chair', 'treasurer', 'secretary', 'loan_officer', 'auditor')),
  joined_at DATE DEFAULT CURRENT_DATE,
  UNIQUE(vsla_id, farmer_id)
);

CREATE TABLE vsla_transactions (
  id SERIAL PRIMARY KEY,
  vsla_id INTEGER REFERENCES vsla_groups(id) ON DELETE CASCADE,
  member_id INTEGER REFERENCES vsla_members(id),
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('savings', 'loan', 'loan_repayment', 'maintenance', 'shareout')) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  transaction_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vsla_trans_vsla ON vsla_transactions(vsla_id);
CREATE INDEX idx_vsla_trans_type ON vsla_transactions(transaction_type);

-- =====================================================
-- INPUT INVOICES & SALES
-- =====================================================

CREATE TABLE input_invoices (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
  invoice_type VARCHAR(30) CHECK (invoice_type IN ('compost', 'seedlings', 'tools', 'training')),
  item_description VARCHAR(200),
  quantity DECIMAL(10,2),
  unit_price DECIMAL(10,2),
  total_amount DECIMAL(10,2) NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  issued_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sales (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
  crop_type VARCHAR(50) NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  price_per_kg DECIMAL(10,2) NOT NULL,
  gross_revenue DECIMAL(10,2) NOT NULL,
  input_costs_deducted DECIMAL(10,2) DEFAULT 0.00,
  net_revenue DECIMAL(10,2),
  farmer_share DECIMAL(10,2), -- 50% after input deduction
  sanza_share DECIMAL(10,2),  -- 50% after input deduction
  buyer_id INTEGER REFERENCES users(id),
  sale_date DATE DEFAULT CURRENT_DATE,
  payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'partial')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sales_farmer ON sales(farmer_id);
CREATE INDEX idx_sales_date ON sales(sale_date);

-- =====================================================
-- WAREHOUSE / STORAGE
-- =====================================================

CREATE TABLE storage_facilities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(30) CHECK (type IN ('cold_room', 'insulated_shed', 'ambient')) DEFAULT 'ambient',
  location_coordinates GEOMETRY(POINT, 4326),
  capacity_kg DECIMAL(10,2) NOT NULL,
  current_usage_kg DECIMAL(10,2) DEFAULT 0.00,
  user_fee_per_kg_per_week DECIMAL(10,2) DEFAULT 50.00, -- RWF
  vsla_id INTEGER REFERENCES vsla_groups(id), -- VSLA managing maintenance
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE stored_produce (
  id SERIAL PRIMARY KEY,
  warehouse_id INTEGER REFERENCES storage_facilities(id) ON DELETE CASCADE,
  farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
  crop_type VARCHAR(50) NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  quality_grade VARCHAR(10) CHECK (quality_grade IN ('A', 'B', 'C')),
  stored_at TIMESTAMP DEFAULT NOW(),
  expected_duration_weeks INTEGER,
  retrieved_at TIMESTAMP,
  storage_fee_calculated DECIMAL(10,2) DEFAULT 0.00,
  storage_fee_paid DECIMAL(10,2) DEFAULT 0.00,
  payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid')) DEFAULT 'pending'
);

CREATE INDEX idx_stored_produce_warehouse ON stored_produce(warehouse_id);
CREATE INDEX idx_stored_produce_farmer ON stored_produce(farmer_id);
CREATE INDEX idx_stored_produce_active ON stored_produce(retrieved_at) WHERE retrieved_at IS NULL;

CREATE TABLE temperature_logs (
  id SERIAL PRIMARY KEY,
  warehouse_id INTEGER REFERENCES storage_facilities(id) ON DELETE CASCADE,
  temperature_celsius DECIMAL(5,2),
  humidity_percent DECIMAL(5,2),
  recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE maintenance_logs (
  id SERIAL PRIMARY KEY,
  warehouse_id INTEGER REFERENCES storage_facilities(id) ON DELETE CASCADE,
  maintenance_type VARCHAR(30) CHECK (maintenance_type IN ('cleaning', 'repair', 'upgrade')),
  description TEXT,
  cost DECIMAL(10,2),
  performed_by INTEGER REFERENCES users(id),
  maintenance_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- COMPOST PRODUCTION
-- =====================================================

CREATE TABLE compost_batches (
  id SERIAL PRIMARY KEY,
  batch_number VARCHAR(50) UNIQUE NOT NULL,
  production_site VARCHAR(100),
  start_date DATE NOT NULL,
  completion_date DATE,
  total_kg_produced DECIMAL(10,2),
  quality_score DECIMAL(3,1) CHECK (quality_score BETWEEN 0 AND 10),
  status VARCHAR(20) CHECK (status IN ('in_progress', 'completed', 'distributed')) DEFAULT 'in_progress',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE compost_workdays (
  id SERIAL PRIMARY KEY,
  batch_id INTEGER REFERENCES compost_batches(id) ON DELETE CASCADE,
  worker_name VARCHAR(100),
  work_date DATE NOT NULL,
  hours_worked DECIMAL(5,2),
  daily_stipend DECIMAL(10,2) DEFAULT 150.00, -- €2.50 * 60 RWF/EUR
  payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TRAINING & CAPACITY BUILDING
-- =====================================================

CREATE TABLE training_sessions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  training_type VARCHAR(50) CHECK (training_type IN ('nutrition', 'agronomy', 'vsla', 'post_harvest', 'business')),
  facilitator_id INTEGER REFERENCES users(id),
  location VARCHAR(200),
  session_date DATE NOT NULL,
  duration_hours DECIMAL(5,2),
  is_cascade BOOLEAN DEFAULT false, -- Champion-led cascade
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE training_attendance (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES training_sessions(id) ON DELETE CASCADE,
  farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
  attended BOOLEAN DEFAULT true,
  performance_score DECIMAL(3,1) CHECK (performance_score BETWEEN 0 AND 10),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(session_id, farmer_id)
);

-- =====================================================
-- MOBILE MONEY TRANSACTIONS (Audit Trail)
-- =====================================================

CREATE TABLE mobile_money_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  transaction_type VARCHAR(30) CHECK (transaction_type IN ('stipend', 'profit_share', 'loan_disbursement')),
  amount DECIMAL(10,2) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  provider VARCHAR(20) CHECK (provider IN ('MTN', 'AIRTEL')),
  transaction_id VARCHAR(100) UNIQUE,
  status VARCHAR(20) CHECK (status IN ('pending', 'success', 'failed')) DEFAULT 'pending',
  initiated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_momo_user ON mobile_money_transactions(user_id);
CREATE INDEX idx_momo_status ON mobile_money_transactions(status);

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- View: VSLA Financial Summary
CREATE VIEW vsla_financial_summary AS
SELECT 
  vg.id,
  vg.name,
  COUNT(DISTINCT vm.id) as member_count,
  COALESCE(SUM(CASE WHEN vt.transaction_type = 'savings' THEN vt.amount ELSE 0 END), 0) as total_savings,
  COALESCE(SUM(CASE WHEN vt.transaction_type = 'loan' THEN vt.amount ELSE 0 END), 0) as total_loans_disbursed,
  COALESCE(SUM(CASE WHEN vt.transaction_type = 'loan_repayment' THEN vt.amount ELSE 0 END), 0) as total_repayments,
  COALESCE(SUM(CASE WHEN vt.transaction_type = 'maintenance' THEN vt.amount ELSE 0 END), 0) as maintenance_fund
FROM vsla_groups vg
LEFT JOIN vsla_members vm ON vg.id = vm.vsla_id
LEFT JOIN vsla_transactions vt ON vg.id = vt.vsla_id
GROUP BY vg.id, vg.name;

-- View: Farmer Sales Performance
CREATE VIEW farmer_sales_performance AS
SELECT 
  f.id as farmer_id,
  u.full_name,
  COUNT(s.id) as total_sales,
  SUM(s.quantity_kg) as total_kg_sold,
  SUM(s.gross_revenue) as total_gross_revenue,
  SUM(s.farmer_share) as total_earnings
FROM farmers f
JOIN users u ON f.user_id = u.id
LEFT JOIN sales s ON f.id = s.farmer_id
GROUP BY f.id, u.full_name;

-- =====================================================
-- TRIGGERS FOR AUTO-CALCULATIONS
-- =====================================================

-- Trigger: Calculate Net Revenue and Profit Share on Sale Insert
CREATE OR REPLACE FUNCTION calculate_profit_share()
RETURNS TRIGGER AS $$
BEGIN
  -- Deduct outstanding input costs
  SELECT COALESCE(SUM(total_amount), 0) INTO NEW.input_costs_deducted
  FROM input_invoices
  WHERE farmer_id = NEW.farmer_id AND is_paid = false;
  
  -- Calculate net revenue
  NEW.net_revenue := NEW.gross_revenue - NEW.input_costs_deducted;
  
  -- 50/50 split
  NEW.farmer_share := NEW.net_revenue / 2;
  NEW.sanza_share := NEW.net_revenue / 2;
  
  -- Mark input invoices as paid
  UPDATE input_invoices
  SET is_paid = true
  WHERE farmer_id = NEW.farmer_id AND is_paid = false;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_profit_share
BEFORE INSERT ON sales
FOR EACH ROW
EXECUTE FUNCTION calculate_profit_share();

-- Trigger: Calculate Storage Fees
CREATE OR REPLACE FUNCTION calculate_storage_fee()
RETURNS TRIGGER AS $$
DECLARE
  weeks_stored DECIMAL(10,2);
  fee_rate DECIMAL(10,2);
BEGIN
  IF NEW.retrieved_at IS NOT NULL THEN
    -- Get fee rate
    SELECT user_fee_per_kg_per_week INTO fee_rate
    FROM storage_facilities
    WHERE id = NEW.warehouse_id;
    
    -- Calculate weeks
    weeks_stored := EXTRACT(EPOCH FROM (NEW.retrieved_at - NEW.stored_at)) / (7 * 24 * 60 * 60);
    
    -- Calculate fee
    NEW.storage_fee_calculated := NEW.quantity_kg * fee_rate * weeks_stored;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_storage_fee
BEFORE UPDATE ON stored_produce
FOR EACH ROW
WHEN (OLD.retrieved_at IS NULL AND NEW.retrieved_at IS NOT NULL)
EXECUTE FUNCTION calculate_storage_fee();

-- =====================================================
-- SEED DATA (Optional Development Data)
-- =====================================================

-- Insert sample manager user
INSERT INTO users (phone, full_name, role) VALUES
('+250788000001', 'Jean Claude Uwimana', 'manager'),
('+250788000002', 'Marie Mukamana', 'agronomist'),
('+250788000003', 'Alice Nyirahabimana', 'farmer'),
('+250788000004', 'Grace Mukankusi', 'champion');

-- Insert sample cohort
INSERT INTO cohorts (name, location, total_members) VALUES
('Cohort 1 - Gahanga', 'Gahanga Sector, Kicukiro District', 20);

-- =====================================================
-- END OF SCHEMA
-- =====================================================