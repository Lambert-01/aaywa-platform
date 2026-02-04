-- Run this script manually in your PostgreSQL client
-- For Windows, use pgAdmin or connect via command line

-- =============================================
-- GEOSPATIAL COMMAND CENTER SCHEMA ENHANCEMENTS
-- Adds geospatial capabilities for Maps Page
-- =============================================

-- Enhance farmers table with plot boundaries and household type
ALTER TABLE farmers 
ADD COLUMN IF NOT EXISTS plot_boundary_coordinates JSONB,
ADD COLUMN IF NOT EXISTS plot_area_hectares DECIMAL(8,4),
ADD COLUMN IF NOT EXISTS household_type VARCHAR(50) CHECK (household_type IN ('teen_mother', 'female_headed', 'land_poor'));

-- Enhance cohorts table with boundary polygons
ALTER TABLE cohorts 
ADD COLUMN IF NOT EXISTS boundary_coordinates JSONB,
ADD COLUMN IF NOT EXISTS boundary_color VARCHAR(20) DEFAULT '#4CAF50';

-- Enhance storage_facilities with temperature range (if not exists)
ALTER TABLE storage_facilities
ADD COLUMN IF NOT EXISTS temperature_min DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS temperature_max DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS description TEXT;

-- Create aggregation centers table
CREATE TABLE IF NOT EXISTS aggregation_centers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location_lat DECIMAL(10,8) NOT NULL,
  location_lng DECIMAL(11,8) NOT NULL,
  buyer_partners TEXT[],
  operating_hours VARCHAR(100),
  contact_info TEXT,
  status VARCHAR(50) DEFAULT 'operational' CHECK (status IN ('operational', 'offline', 'maintenance')),
  last_pickup_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create map measurements table for storing distance/area calculations
CREATE TABLE IF NOT EXISTS map_measurements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  measurement_type VARCHAR(20) CHECK (measurement_type IN ('distance', 'area')),
  coordinates JSONB NOT NULL,
  calculated_value DECIMAL(12,4),
  unit VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- PERFORMANCE INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_farmers_household_type ON farmers(household_type);
CREATE INDEX IF NOT EXISTS idx_farmers_plot_boundary ON farmers USING GIN(plot_boundary_coordinates);
CREATE INDEX IF NOT EXISTS idx_cohorts_boundary ON cohorts USING GIN(boundary_coordinates);
CREATE INDEX IF NOT EXISTS idx_aggregation_centers_location ON aggregation_centers(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_map_measurements_user ON map_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_map_measurements_type ON map_measurements(measurement_type);

-- =============================================
-- GEOSPATIAL VIEWS
-- =============================================

-- Farmer Plots with Geographic Data
CREATE OR REPLACE VIEW farmer_plots_geo AS
SELECT 
    f.id,
    f.full_name as name,
    f.household_type,
    f.plot_boundary_coordinates,
    f.plot_area_hectares,
    c.id as cohort_id,
    c.name as cohort_name,
    c.cropping_system,
    c.boundary_color as cohort_color,
    COALESCE(
        (SELECT SUM(gross_revenue) FROM sales WHERE farmer_id = f.id),
        0
    ) as total_sales,
    COALESCE(
        (SELECT seed_capital FROM vsla_groups WHERE id = (SELECT vsla_id FROM vsla_members WHERE farmer_id = f.id LIMIT 1)),
        0
    ) as vsla_balance
FROM farmers f
LEFT JOIN cohorts c ON f.cohort_id = c.id
WHERE f.plot_boundary_coordinates IS NOT NULL;

-- Cohort Geographic Summary
CREATE OR REPLACE VIEW cohort_geo_summary AS
SELECT 
    c.id,
    c.name,
    c.cropping_system,
    c.boundary_coordinates,
    c.boundary_color,
    COUNT(f.id) as farmer_count,
    SUM(f.plot_area_hectares) as total_area_hectares,
    AVG(
        (SELECT AVG(quantity_kg) FROM harvest_records WHERE farmer_id = f.id)
    ) as avg_yield_kg
FROM cohorts c
LEFT JOIN farmers f ON f.cohort_id = c.id
WHERE c.boundary_coordinates IS NOT NULL
GROUP BY c.id;

-- Warehouse Geographic View
CREATE OR REPLACE VIEW warehouse_geo AS
SELECT 
    sf.id,
    sf.name,
    sf.type,
    sf.location_lat,
    sf.location_lng,
    sf.location_name,
    sf.capacity_kg,
    sf.current_usage_kg,
    sf.temperature_celsius,
    sf.temperature_min,
    sf.temperature_max,
    sf.status,
    CASE 
        WHEN sf.capacity_kg > 0 THEN ROUND((sf.current_usage_kg / sf.capacity_kg * 100)::numeric, 2)
        ELSE 0
    END as usage_percentage,
    COUNT(DISTINCT it.id) as transaction_count
FROM storage_facilities sf
LEFT JOIN inventory_transactions it ON sf.id = it.facility_id
WHERE sf.location_lat IS NOT NULL AND sf.location_lng IS NOT NULL
GROUP BY sf.id;

-- Aggregation Centers with Activity
CREATE OR REPLACE VIEW aggregation_centers_activity AS
SELECT 
    ac.*,
    COUNT(o.id) as total_orders,
    SUM(o.total_amount) as total_revenue
FROM aggregation_centers ac
LEFT JOIN orders o ON o.aggregation_center_id = ac.id
GROUP BY ac.id;

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-update updated_at for aggregation centers
DROP TRIGGER IF EXISTS update_aggregation_centers_updated_at ON aggregation_centers;
CREATE TRIGGER update_aggregation_centers_updated_at
    BEFORE UPDATE ON aggregation_centers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON COLUMN farmers.plot_boundary_coordinates IS 'JSONB array of {lat, lng} points forming plot polygon';
COMMENT ON COLUMN farmers.plot_area_hectares IS 'Calculated area of plot in hectares';
COMMENT ON COLUMN farmers.household_type IS 'Type of household: teen_mother, female_headed, or land_poor';
COMMENT ON COLUMN cohorts.boundary_coordinates IS 'JSONB array of {lat, lng} points forming cohort boundary polygon';
COMMENT ON COLUMN cohorts.boundary_color IS 'Hex color code for map visualization';
COMMENT ON TABLE aggregation_centers IS 'Central collection points for aggregating farmer produce';
COMMENT ON TABLE map_measurements IS 'User-created distance and area measurements from Maps Page';
