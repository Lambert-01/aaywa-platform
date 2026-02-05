-- AAYWA Platform - Alerts Table
-- Real-time intelligence and notification system

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  alert_type VARCHAR(50) NOT NULL, -- 'repayment_risk', 'temperature_warning', 'engagement_low', 'stock_low', 'performance_alert'
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'warning', 'info', 'success')),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  action_url VARCHAR(200), -- URL to navigate to for more details
  entity_type VARCHAR(50), -- 'cohort', 'farmer', 'warehouse', 'vsla_group'
  entity_id INTEGER,
  entity_name VARCHAR(200), -- Denormalized for performance
  triggered_by VARCHAR(100), -- What triggered this alert
  threshold_value DECIMAL(10,2), -- The threshold that was crossed
  actual_value DECIMAL(10,2), -- The actual value that triggered the alert
  dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMP,
  dismissed_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_alerts_severity ON alerts(severity) WHERE NOT dismissed;
CREATE INDEX idx_alerts_entity ON alerts(entity_type, entity_id) WHERE NOT dismissed;
CREATE INDEX idx_alerts_created ON alerts(created_at DESC) WHERE NOT dismissed;
CREATE INDEX idx_alerts_type ON alerts(alert_type) WHERE NOT dismissed;

-- Auto-update trigger
CREATE TRIGGER update_alerts_updated_at 
BEFORE UPDATE ON alerts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE alerts IS 'Real-time intelligence alerts for platform monitoring';
COMMENT ON COLUMN alerts.severity IS 'critical=red, warning=yellow, info=blue, success=green';
COMMENT ON COLUMN alerts.action_url IS 'Deep link to relevant page, e.g. /dashboard/cohorts/3';

SELECT 'Alerts table created successfully' AS status;
