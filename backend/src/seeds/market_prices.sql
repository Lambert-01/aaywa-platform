-- Seed Market Prices Data for Offline Mobile Access
-- This provides realistic market price data for farmers

INSERT INTO market_prices (crop_type, quality_grade, price_per_kg, market_location, trend, demand_level) VALUES
-- Avocado Prices
('avocado', 'premium', 350.00, 'Kigali Main Market', 'rising', 'high'),
('avocado', 'grade_a', 280.00, 'Kigali Main Market', 'rising', 'high'),
('avocado', 'grade_b', 220.00, 'Kigali Main Market', 'stable', 'moderate'),
('avocado', 'standard', 180.00, 'Kigali Main Market', 'stable', 'moderate'),

('avocado', 'premium', 340.00, 'Huye Market', 'stable', 'moderate'),
('avocado', 'grade_a', 270.00, 'Huye Market', 'stable', 'moderate'),
('avocado', 'grade_b', 210.00, 'Huye Market', 'falling', 'low'),
('avocado', 'standard', 170.00, 'Huye Market', 'falling', 'low'),

-- Macadamia Prices
('macadamia', 'premium', 850.00, 'Kigali Main Market', 'rising', 'very_high'),
('macadamia', 'grade_a', 750.00, 'Kigali Main Market', 'rising', 'very_high'),
('macadamia', 'grade_b', 650.00, 'Kigali Main Market', 'stable', 'high'),
('macadamia', 'standard', 550.00, 'Kigali Main Market', 'stable', 'high'),

('macadamia', 'premium', 830.00, 'Huye Market', 'stable', 'high'),
('macadamia', 'grade_a', 730.00, 'Huye Market', 'stable', 'high'),
('macadamia', 'grade_b', 630.00, 'Huye Market', 'stable', 'moderate'),
('macadamia', 'standard', 530.00, 'Huye Market', 'stable', 'moderate')

ON CONFLICT DO NOTHING;

SELECT 'Market prices seeded successfully' AS status;
