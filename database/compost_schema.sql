-- =====================================================
-- AAYWA Compost Management Schema Enhancement (Final Fix)
-- =====================================================

-- 1. Ensure Feedstock Table Exists
CREATE TABLE IF NOT EXISTS compost_feedstock_items (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL REFERENCES compost_batches(id) ON DELETE CASCADE,
    material_type VARCHAR(100) NOT NULL,
    percentage DECIMAL(5, 2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    kg_amount DECIMAL(10, 2) NOT NULL CHECK (kg_amount >= 0),
    cost_per_kg DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_percentage CHECK (percentage >= 0 AND percentage <= 100)
);

-- 2. Enhanced compost_batches table - Add new columns safely
-- Using standard PostgreSQL syntax (IF NOT EXISTS) to avoid errors
ALTER TABLE compost_batches ADD COLUMN IF NOT EXISTS produced_by INTEGER REFERENCES users(id);
ALTER TABLE compost_batches ADD COLUMN IF NOT EXISTS batch_number VARCHAR(50);
ALTER TABLE compost_batches ADD COLUMN IF NOT EXISTS quantity_kg DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE compost_batches ADD COLUMN IF NOT EXISTS quality_score DECIMAL(5, 2);

-- Enforce correct types (in case they existed as Integer)
ALTER TABLE compost_batches ALTER COLUMN quality_score TYPE DECIMAL(5, 2);
ALTER TABLE compost_batches ALTER COLUMN quantity_kg TYPE DECIMAL(10, 2);

ALTER TABLE compost_batches ADD COLUMN IF NOT EXISTS feedstock_composition JSONB;
ALTER TABLE compost_batches ADD COLUMN IF NOT EXISTS temperature_log JSONB DEFAULT '[]'::jsonb;
ALTER TABLE compost_batches ADD COLUMN IF NOT EXISTS moisture_readings JSONB DEFAULT '[]'::jsonb;
ALTER TABLE compost_batches ADD COLUMN IF NOT EXISTS maturity_date DATE;
ALTER TABLE compost_batches ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE compost_batches ADD COLUMN IF NOT EXISTS cohort_id INTEGER REFERENCES cohorts(id);
ALTER TABLE compost_batches ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'In Progress';
ALTER TABLE compost_batches ADD COLUMN IF NOT EXISTS production_date DATE DEFAULT CURRENT_DATE;

-- 3. Ensure Workdays Table has correct columns
ALTER TABLE compost_workdays ADD COLUMN IF NOT EXISTS worker_id INTEGER REFERENCES users(id);

-- 4. Create Sales Tracking Table
CREATE TABLE IF NOT EXISTS compost_sales (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL REFERENCES compost_batches(id),
    buyer_name VARCHAR(200) NOT NULL,
    buyer_contact VARCHAR(50),
    kg_sold DECIMAL(10, 2) NOT NULL CHECK (kg_sold > 0),
    price_per_kg DECIMAL(10, 2) NOT NULL CHECK (price_per_kg > 0),
    total_revenue DECIMAL(12, 2) GENERATED ALWAYS AS (kg_sold * price_per_kg) STORED,
    sale_date DATE NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Mobile Money',
    payment_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_compost_batches_status ON compost_batches(status);
CREATE INDEX IF NOT EXISTS idx_compost_batches_cohort ON compost_batches(cohort_id);
CREATE INDEX IF NOT EXISTS idx_compost_batches_dates ON compost_batches(start_date, maturity_date);
CREATE INDEX IF NOT EXISTS idx_compost_workdays_payment ON compost_workdays(payment_status);
CREATE INDEX IF NOT EXISTS idx_compost_feedstock_batch_id ON compost_feedstock_items(batch_id);
CREATE INDEX IF NOT EXISTS idx_compost_sales_batch_id ON compost_sales(batch_id);
CREATE INDEX IF NOT EXISTS idx_compost_sales_date ON compost_sales(sale_date);

-- Safely create indexes that depend on possibly missing columns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='compost_workdays' AND column_name='worker_id') THEN
        CREATE INDEX IF NOT EXISTS idx_compost_workdays_worker_id ON compost_workdays(worker_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='compost_workdays' AND column_name='batch_id') THEN
        CREATE INDEX IF NOT EXISTS idx_compost_workdays_batch_id ON compost_workdays(batch_id);
    END IF;
END $$;


-- 6. Comprehensive View
DROP VIEW IF EXISTS compost_batch_summary;

CREATE OR REPLACE VIEW compost_batch_summary AS
SELECT 
    cb.id,
    cb.batch_number,
    cb.production_date,
    cb.start_date,
    cb.maturity_date,
    cb.quantity_kg,
    cb.quality_score,
    cb.status,
    cb.cohort_id,
    c.name as cohort_name,
    u.full_name as producer_name,
    COALESCE(
        (SELECT json_agg(json_build_object(
            'type', cfi.material_type,
            'percentage', cfi.percentage,
            'kgAmount', cfi.kg_amount,
            'cost', cfi.cost_per_kg
        ))
        FROM compost_feedstock_items cfi
        WHERE cfi.batch_id = cb.id),
        '[]'::json
    ) as feedstock_mix,
    COALESCE(
        (SELECT SUM(cw.daily_wage)
        FROM compost_workdays cw
        WHERE cw.batch_id = cb.id),
        0
    ) as total_labor_cost,
    COALESCE(
        (SELECT SUM(cfi.kg_amount * cfi.cost_per_kg)
        FROM compost_feedstock_items cfi
        WHERE cfi.batch_id = cb.id),
        0
    ) as total_feedstock_cost,
    COALESCE(
        (SELECT SUM(cs.kg_sold)
        FROM compost_sales cs
        WHERE cs.batch_id = cb.id),
        0
    ) as kg_sold,
    COALESCE(
        (SELECT SUM(cs.total_revenue)
        FROM compost_sales cs
        WHERE cs.batch_id = cb.id),
        0
    ) as total_revenue
FROM compost_batches cb
LEFT JOIN users u ON cb.produced_by = u.id
LEFT JOIN cohorts c ON cb.cohort_id = c.id
ORDER BY cb.created_at DESC;

-- 7. Cost Calculation Function
CREATE OR REPLACE FUNCTION calculate_cost_per_kg(batch_id_param INTEGER)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    total_cost DECIMAL(12, 2);
    quantity DECIMAL(10, 2);
BEGIN
    SELECT 
        COALESCE(SUM(cfi.kg_amount * cfi.cost_per_kg), 0) + 
        COALESCE(SUM(cw.daily_wage), 0)
    INTO total_cost
    FROM compost_batches cb
    LEFT JOIN compost_feedstock_items cfi ON cfi.batch_id = cb.id
    LEFT JOIN compost_workdays cw ON cw.batch_id = cb.id
    WHERE cb.id = batch_id_param;
    
    SELECT quantity_kg INTO quantity
    FROM compost_batches
    WHERE id = batch_id_param;
    
    IF quantity > 0 THEN
        RETURN total_cost / quantity;
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql;
