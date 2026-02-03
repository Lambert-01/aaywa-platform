-- AAYWA Platform - Complete Database Schema
-- Run this after initial users table creation

-- Enable PostGIS for geospatial features (Disabled to avoid installation dependency)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- ========================================
-- COHORTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS cohorts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  cropping_system VARCHAR(50) NOT NULL CHECK (cropping_system IN ('avocado', 'macadamia')),
  boundary_coordinates JSONB, -- Storing as GeoJSON
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suspended')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cohorts_system ON cohorts(cropping_system);
CREATE INDEX idx_cohorts_status ON cohorts(status);

-- ========================================
-- VSLA GROUPS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS vsla_groups (
  id SERIAL PRIMARY KEY,
  cohort_id INTEGER REFERENCES cohorts(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  seed_capital DECIMAL(10,2) DEFAULT 12000.00, -- €10 = RWF 12,000
  total_savings DECIMAL(10,2) DEFAULT 0.00,
  member_count INTEGER DEFAULT 0,
  meeting_day VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vsla_cohort ON vsla_groups(cohort_id);

-- ========================================
-- FARMERS TABLE (Enhanced)
-- ========================================
CREATE TABLE IF NOT EXISTS farmers (
  id SERIAL PRIMARY KEY,
  cohort_id INTEGER REFERENCES cohorts(id),
  vsla_id INTEGER REFERENCES vsla_groups(id),
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  household_type VARCHAR(50) CHECK (household_type IN ('teen_mother', 'female_headed', 'land_poor', 'champion', 'standard')),
  location_coordinates JSONB, -- Storing as GeoJSON
  plot_size_hectares DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_farmers_cohort ON farmers(cohort_id);
CREATE INDEX idx_farmers_vsla ON farmers(vsla_id);
CREATE INDEX idx_farmers_household ON farmers(household_type);
CREATE INDEX idx_farmers_active ON farmers(is_active);

-- ========================================
-- COMPOST BATCHES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS compost_batches (
  id SERIAL PRIMARY KEY,
  batch_number VARCHAR(50) UNIQUE NOT NULL,
  quality_score INTEGER CHECK (quality_score BETWEEN 0 AND 100),
  kg_produced DECIMAL(10,2),
  temperature_max DECIMAL(5,2),
  start_date DATE NOT NULL,
  maturity_date DATE,
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'curing', 'completed', 'sold')),
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_compost_status ON compost_batches(status);
CREATE INDEX idx_compost_batch_number ON compost_batches(batch_number);

-- ========================================
-- COMPOST WORKDAYS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS compost_workdays (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
  batch_id INTEGER REFERENCES compost_batches(id) ON DELETE CASCADE,
  workday_date DATE NOT NULL,
  hours_worked DECIMAL(4,2) DEFAULT 8.00,
  stipend_amount DECIMAL(10,2) DEFAULT 3000.00, -- €2.50 = RWF 3,000
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  payment_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workdays_farmer ON compost_workdays(farmer_id);
CREATE INDEX idx_workdays_batch ON compost_workdays(batch_id);
CREATE INDEX idx_workdays_status ON compost_workdays(payment_status);

-- ========================================
-- TRAINING SESSIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS training_sessions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  trainer_id INTEGER REFERENCES users(id),
  cohort_id INTEGER REFERENCES cohorts(id),
  topic VARCHAR(100),
  description TEXT,
  scheduled_date TIMESTAMP NOT NULL,
  duration_hours DECIMAL(4,2) DEFAULT 2.00,
  attendance_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_training_trainer ON training_sessions(trainer_id);
CREATE INDEX idx_training_cohort ON training_sessions(cohort_id);
CREATE INDEX idx_training_status ON training_sessions(status);
CREATE INDEX idx_training_date ON training_sessions(scheduled_date);

-- ========================================
-- INPUT INVOICES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS input_invoices (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER REFERENCES farmers(id),
  input_type VARCHAR(50) NOT NULL, -- fertilizer, pesticide, tools, etc.
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  invoice_date DATE DEFAULT CURRENT_DATE,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'deferred')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_inputs_farmer ON input_invoices(farmer_id);
CREATE INDEX idx_inputs_type ON input_invoices(input_type);

-- ========================================
-- SALES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
  crop_type VARCHAR(50) NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  gross_revenue DECIMAL(10,2) NOT NULL,
  input_cost DECIMAL(10,2) DEFAULT 0.00,
  net_revenue DECIMAL(10,2) NOT NULL,
  farmer_share DECIMAL(10,2) NOT NULL, -- 70%
  sanza_share DECIMAL(10,2) NOT NULL,  -- 30%
  sale_date TIMESTAMP DEFAULT NOW(),
  buyer_name VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sales_farmer ON sales(farmer_id);
CREATE INDEX idx_sales_crop ON sales(crop_type);
CREATE INDEX idx_sales_date ON sales(sale_date);

-- ========================================
-- WAREHOUSES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS warehouses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(200),
  capacity_kg DECIMAL(10,2),
  current_stock_kg DECIMAL(10,2) DEFAULT 0.00,
  manager_id INTEGER REFERENCES users(id),
  coordinates JSONB, -- Storing as GeoJSON
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_warehouse_manager ON warehouses(manager_id);

-- ========================================
-- CATALOG TABLE (for buyer orders)
-- ========================================
CREATE TABLE IF NOT EXISTS catalog (
  id SERIAL PRIMARY KEY,
  crop_type VARCHAR(100) NOT NULL,
  variety VARCHAR(100),
  price_per_kg DECIMAL(10, 2),
  available_quantity_kg DECIMAL(10, 2),
  quality_grade VARCHAR(50),
  harvest_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Harvest Marketplace Tables

-- Products available for public marketplace
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  product_type VARCHAR(50) NOT NULL, -- 'avocado', 'macadamia', 'vegetables'
  box_size DECIMAL(5,2) NOT NULL, -- kg per box
  cohort_id INTEGER REFERENCES cohorts(id),
  harvest_date DATE NOT NULL,
  available_quantity INTEGER NOT NULL, -- number of boxes available
  price_per_kg DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL, -- box_size * price_per_kg
  description TEXT,
  certifications JSONB, -- ['organic_compost', 'women_led', 'fair_trade']
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'sold_out'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer orders from public marketplace
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL, -- AAY-2026-087
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(100),
  customer_type VARCHAR(50), -- 'restaurant', 'hotel', 'exporter', 'individual'
  delivery_address TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL, -- 'mobile_money', 'bank_transfer', 'cash'
  payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  order_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
  tracking_number VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Line items for each order
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL, -- number of boxes
  unit_price DECIMAL(10,2) NOT NULL, -- price per box at time of order
  total_price DECIMAL(10,2) NOT NULL, -- quantity * unit_price
  farmer_share DECIMAL(10,2) NOT NULL, -- 50% of net revenue
  sanza_share DECIMAL(10,2) NOT NULL, -- 50% of net revenue
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- AUTO-UPDATE TRIGGERS
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cohorts_updated_at BEFORE UPDATE ON cohorts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vsla_updated_at BEFORE UPDATE ON vsla_groups
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farmers_updated_at BEFORE UPDATE ON farmers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compost_updated_at BEFORE UPDATE ON compost_batches
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_updated_at BEFORE UPDATE ON training_sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- COMMENTS FOR DOCUMENTATION
-- ========================================
COMMENT ON TABLE cohorts IS 'Coffee planting cohorts grouped by cropping system';
COMMENT ON TABLE vsla_groups IS 'Village Savings and Loan Associations with €10/member seed capital';
COMMENT ON TABLE farmers IS 'Individual farmer profiles with household classification';
COMMENT ON TABLE compost_batches IS 'Compost production tracking with quality scores';
COMMENT ON TABLE compost_workdays IS 'Daily stipend tracking for compost workers (RWF 3,000/day)';
COMMENT ON TABLE training_sessions IS 'Farmer training sessions by cohort';
COMMENT ON TABLE sales IS 'Crop sales with 70-30 profit sharing (farmer-sanza)';

-- Success message
SELECT 'Database schema created successfully. Run seeding script next.' AS status;
