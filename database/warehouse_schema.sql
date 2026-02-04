-- =============================================
-- WAREHOUSE MANAGEMENT SCHEMA (WITHOUT POSTGIS)
-- =============================================

-- 1. Storage Facilities Table
CREATE TABLE IF NOT EXISTS storage_facilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('cold_room', 'insulated_shed', 'ambient_storage')),
    location_name VARCHAR(255),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    capacity_kg DECIMAL(10,2) NOT NULL,
    current_usage_kg DECIMAL(10,2) DEFAULT 0,
    temperature_celsius DECIMAL(5,2),
    humidity_percent DECIMAL(5,2),
    status VARCHAR(50) DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance_due', 'at_risk', 'offline')),
    maintenance_due_date TIMESTAMP,
    last_maintenance_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Inventory Transactions Table
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id SERIAL PRIMARY KEY,
    facility_id INTEGER REFERENCES storage_facilities(id) ON DELETE CASCADE,
    crop_type VARCHAR(100) NOT NULL,
    quantity_kg DECIMAL(10,2) NOT NULL,
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
    reason VARCHAR(100) NOT NULL CHECK (reason IN ('harvest', 'sale', 'donation', 'damage', 'spoilage', 'transfer')),
    quality_grade VARCHAR(10),
    temperature_at_transaction DECIMAL(5,2),
    related_farmer_id INTEGER,
    related_order_id INTEGER,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'completed',
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Temperature Logs Table
CREATE TABLE IF NOT EXISTS temperature_logs (
    id SERIAL PRIMARY KEY,
    facility_id INTEGER REFERENCES storage_facilities(id) ON DELETE CASCADE,
    temperature_celsius DECIMAL(5,2) NOT NULL,
    humidity_percent DECIMAL(5,2),
    alert_triggered BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Maintenance Records Table
CREATE TABLE IF NOT EXISTS maintenance_records (
    id SERIAL PRIMARY KEY,
    facility_id INTEGER REFERENCES storage_facilities(id) ON DELETE CASCADE,
    issue_description TEXT NOT NULL,
    maintenance_type VARCHAR(50) CHECK (maintenance_type IN ('preventive', 'reactive', 'emergency')),
    cost DECIMAL(10,2),
    vendor_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    scheduled_date TIMESTAMP,
    completed_date TIMESTAMP,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Post-Harvest Losses Table
CREATE TABLE IF NOT EXISTS post_harvest_losses (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES inventory_transactions(id) ON DELETE CASCADE,
    loss_category VARCHAR(100) CHECK (loss_category IN ('physical_damage', 'spoilage', 'weight_loss', 'theft', 'other')),
    loss_quantity_kg DECIMAL(10,2),
    loss_value DECIMAL(10,2),
    root_cause TEXT,
    prevention_strategy TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_transactions_facility ON inventory_transactions(facility_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON inventory_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_crop ON inventory_transactions(crop_type);
CREATE INDEX IF NOT EXISTS idx_temp_logs_facility ON temperature_logs(facility_id);
CREATE INDEX IF NOT EXISTS idx_temp_logs_recorded ON temperature_logs(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_facility ON maintenance_records(facility_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_records(status);

-- =============================================
-- VIEWS FOR REPORTING
-- =============================================

-- Facility Summary View
CREATE OR REPLACE VIEW facility_summary AS
SELECT 
    sf.id,
    sf.name,
    sf.type,
    sf.location_name,
    sf.capacity_kg,
    sf.current_usage_kg,
    sf.temperature_celsius,
    sf.humidity_percent,
    sf.status,
    CASE 
        WHEN sf.capacity_kg > 0 THEN ROUND((sf.current_usage_kg / sf.capacity_kg * 100)::numeric, 2)
        ELSE 0
    END as usage_percentage,
    COUNT(DISTINCT it.id) as transaction_count
FROM storage_facilities sf
LEFT JOIN inventory_transactions it ON sf.id = it.facility_id
GROUP BY sf.id;

-- Inventory Balance View
CREATE OR REPLACE VIEW inventory_balance AS
SELECT 
    facility_id,
    crop_type,
    SUM(CASE WHEN direction = 'incoming' THEN quantity_kg ELSE 0 END) as total_incoming_kg,
    SUM(CASE WHEN direction = 'outgoing' THEN quantity_kg ELSE 0 END) as total_outgoing_kg,
    SUM(CASE WHEN direction = 'incoming' THEN quantity_kg ELSE -quantity_kg END) as current_stock_kg
FROM inventory_transactions
GROUP BY facility_id, crop_type
HAVING SUM(CASE WHEN direction = 'incoming' THEN quantity_kg ELSE -quantity_kg END) > 0;

-- Loss Analysis View
CREATE OR REPLACE VIEW loss_analysis AS
SELECT 
    DATE_TRUNC('month', phl.created_at) as loss_month,
    phl.loss_category,
    COUNT(*) as incident_count,
    SUM(phl.loss_quantity_kg) as total_loss_kg,
    SUM(phl.loss_value) as total_loss_value
FROM post_harvest_losses phl
GROUP BY DATE_TRUNC('month', phl.created_at), phl.loss_category
ORDER BY loss_month DESC;

-- =============================================
-- TRIGGER FOR UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_storage_facilities_updated_at ON storage_facilities;
CREATE TRIGGER update_storage_facilities_updated_at
    BEFORE UPDATE ON storage_facilities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
