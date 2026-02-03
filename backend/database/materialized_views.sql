-- Materialized View for Cohort Metrics
-- Aggregates performance data to ensure fast dashboard loading

CREATE MATERIALIZED VIEW IF NOT EXISTS cohort_metrics AS
SELECT 
    c.id as cohort_id,
    c.name,
    -- Yield Performance (comparing current vs baseline from farmers)
    COALESCE(AVG(f.yield_kg), 0) as avg_current_yield,
    COALESCE(AVG(f.baseline_yield), 0) as avg_baseline_yield,
    
    -- Repayment Rate (from sales/invoices)
    -- Assuming an 'invoices' or 'input_requests' table exists. 
    -- If not, we use a placeholder calculation based on sales for now.
    92.5 as repayment_rate, -- Placeholder until invoice table is confirmed
    
    -- Training Attendance
    -- Calculating average attendance % across all sessions for this cohort
    COALESCE(
        (SELECT AVG(attendance_rate) 
         FROM training_sessions ts 
         WHERE ts.cohort_id = c.id), 
    0) as training_attendance_rate,
    
    -- Financials
    COALESCE(SUM(s.total_amount), 0) as total_revenue,
    
    -- Member Count
    COUNT(DISTINCT f.id) as active_farmers

FROM cohorts c
LEFT JOIN farmers f ON c.id = f.cohort_id
LEFT JOIN sales s ON c.id = s.cohort_id
GROUP BY c.id;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_cohort_metrics_id ON cohort_metrics(cohort_id);

-- Function to refresh the view (can be called via cron or trigger)
CREATE OR REPLACE FUNCTION refresh_cohort_metrics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY cohort_metrics;
END;
$$ LANGUAGE plpgsql;
