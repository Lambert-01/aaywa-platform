-- AAYWA Digital Platform - Seed Data
-- Run this after schema.sql to populate the database with sample data

-- ============================================
-- SAMPLE USERS
-- ============================================

-- Manager
INSERT INTO users (phone, full_name, role, language, password) VALUES
('+250788111111', 'Jean Pierre Manager', 'manager', 'rw', '$2a$10$hash');

-- Agronomists
INSERT INTO users (phone, full_name, role, language, password) VALUES
('+250788222222', 'Marie Claire Agronomist', 'agronomist', 'rw', '$2a$10$hash'),
('+250788222223', 'Paul Farmer Agronomist', 'agronomist', 'en', '$2a$10$hash');

-- Field Facilitators
INSERT INTO users (phone, full_name, role, language, password) VALUES
('+250788333333', 'Alice Facilitator', 'field_facilitator', 'rw', '$2a$10$hash'),
('+250788333334', 'Robert Facilitator', 'field_facilitator', 'rw', '$2a$10$hash');

-- Farmers (will be linked to farmer profiles)
INSERT INTO users (phone, full_name, role, language, password) VALUES
('+250788444001', 'Claudine Mukamana', 'farmer', 'rw', '$2a$10$hash'),
('+250788444002', 'Jeanne d Arc Uwimana', 'farmer', 'rw', '$2a$10$hash'),
('+250788444003', 'Marie Rose Nyirahabimana', 'farmer', 'rw', '$2a$10$hash'),
('+250788444004', 'Beatrice Mukandayisenga', 'farmer', 'rw', '$2a$10$hash'),
('+250788444005', 'Dorothee Musabyimana', 'farmer', 'rw', '$2a$10$hash'),
('+250788444006', 'Champion Aline', 'champion', 'rw', '$2a$10$hash'),
('+250788444007', 'Champion Beatrice', 'champion', 'rw', '$2a$10$hash');

-- Buyer
INSERT INTO users (phone, full_name, role, language, password) VALUES
('+250788555555', 'Afro Source Buyer', 'buyer', 'en', '$2a$10$hash');

-- ============================================
-- SAMPLE COHORTS
-- ============================================

INSERT INTO cohorts (name, cropping_system, boundary_coordinates) VALUES
('Cohort A - Kigali North', 'avocado_macadamia', ST_GeomFromText('POLYGON((30.0 -1.9,30.1 -1.9,30.1 -2.0,30.0 -2.0,30.0 -1.9))', 4326)),
('Cohort B - Kigali South', 'avocado_macadamia', ST_GeomFromText('POLYGON((30.05 -2.0,30.15 -2.0,30.15 -2.1,30.05 -2.1,30.05 -2.0))', 4326)),
('Cohort C - Vegetable Hub', 'vegetable_farming', ST_GeomFromText('POLYGON((29.9 -1.95,30.0 -1.95,30.0 -2.05,29.9 -2.05,29.9 -1.95))', 4326));

-- ============================================
-- SAMPLE VSLA GROUPS
-- ============================================

INSERT INTO vsla_groups (cohort_id, name, seed_capital, formation_date) VALUES
(1, 'Dufatanye VSLA', 120000.00, '2024-01-15'), -- 10 members x 12,000
(1, 'Tugane VSLA', 96000.00, '2024-02-01'),      -- 8 members x 12,000
(2, 'Twitezimbere VSLA', 108000.00, '2024-01-20'), -- 9 members x 12,000
(3, 'Humuriza VSLA', 84000.00, '2024-03-01');      -- 7 members x 12,000

-- ============================================
-- SAMPLE FARMERS
-- ============================================

INSERT INTO farmers (user_id, cohort_id, vsla_id, date_of_birth, household_type, location_coordinates, farm_size_hectares) VALUES
-- Cohort A farmers
(5, 1, 1, '1990-03-15', 'single_mother', ST_GeomFromText('POINT(30.05 -1.95)', 4326), 0.5),
(6, 1, 1, '1988-07-22', 'widowed', ST_GeomFromText('POINT(30.06 -1.96)', 4326), 0.75),
(7, 1, 1, '1992-11-08', 'single_mother', ST_GeomFromText('POINT(30.04 -1.94)', 4326), 0.6),
(8, 1, 2, '1985-05-30', 'married', ST_GeomFromText('POINT(30.08 -1.98)', 4326), 1.0),
(9, 1, 2, '1995-09-12', 'single', ST_GeomFromText('POINT(30.07 -1.97)', 4326), 0.4),

-- Champions
(10, 1, 1, '1982-01-10', 'married', ST_GeomFromText('POINT(30.05 -1.95)', 4326), 1.2),
(11, 2, 3, '1987-04-25', 'widowed', ST_GeomFromText('POINT(30.10 -2.05)', 4326), 0.8);

-- ============================================
-- SAMPLE VSLA MEMBERS (Officers)
-- ============================================

INSERT INTO vsla_members (vsla_id, farmer_id, role) VALUES
(1, 1, 'chair'),
(1, 2, 'treasurer'),
(1, 3, 'secretary'),
(1, 6, 'member'), -- Champion
(2, 4, 'chair'),
(2, 5, 'treasurer'),
(3, 7, 'chair');

-- ============================================
-- SAMPLE INPUT INVOICES
-- ============================================

INSERT INTO input_invoices (farmer_id, items, total_amount, status, issued_by) VALUES
(1, '[{"item": "compost", "quantity": 100, "unit_price": 500}, {"item": "avocado_seedlings", "quantity": 20, "unit_price": 1000}]', 70000.00, 'pending', 2),
(2, '[{"item": "compost", "quantity": 80, "unit_price": 500}, {"item": "macadamia_seedlings", "quantity": 15, "unit_price": 1200}]', 58000.00, 'pending', 2),
(3, '[{"item": "compost", "quantity": 120, "unit_price": 500}]', 60000.00, 'repaid', 2),
(4, '[{"item": "farming_tools", "quantity": 1, "unit_price": 15000}, {"item": "compost", "quantity": 50, "unit_price": 500}]', 40000.00, 'pending', 3);

-- ============================================
-- SAMPLE SALES (with 50/50 profit sharing)
-- ============================================

-- Sale 1: Input repaid
INSERT INTO sales (farmer_id, input_invoice_id, crop_type, quantity, unit_price, gross_revenue, input_cost, net_revenue, farmer_share, sanza_share, buyer_id, settlement_status) VALUES
(3, 3, 'avocado', 50, 1500, 75000.00, 60000.00, 15000.00, 7500.00, 7500.00, 12, 'settled');

-- Sale 2: No input (direct sale)
INSERT INTO sales (farmer_id, crop_type, quantity, unit_price, gross_revenue, input_cost, net_revenue, farmer_share, sanza_share, buyer_id, settlement_status) VALUES
(1, 'vegetables', 30, 800, 24000.00, 0, 24000.00, 12000.00, 12000.00, 12, 'settled');

-- ============================================
-- SAMPLE VSLA TRANSACTIONS
-- ============================================

INSERT INTO vsla_transactions (vsla_id, member_id, transaction_type, amount, description, recorded_by) VALUES
(1, 1, 'savings', 5000.00, 'Weekly savings', 5),
(1, 2, 'savings', 5000.00, 'Weekly savings', 5),
(1, 3, 'savings', 5000.00, 'Weekly savings', 5),
(1, 2, 'loan', 50000.00, 'Emergency loan', 5),
(1, NULL, 'maintenance', 10000.00, 'Warehouse roof repair', 5),
(2, 5, 'savings', 5000.00, 'Weekly savings', 5);

-- ============================================
-- SAMPLE COMPOST BATCHES
-- ============================================

INSERT INTO compost_batches (batch_number, production_date, quantity_kg, quality_score, produced_by, status) VALUES
('CMP-2024-001', '2024-01-10', 5000, 8, 3, 'distributed'),
('CMP-2024-002', '2024-02-15', 6000, 9, 3, 'active'),
('CMP-2024-003', '2024-03-01', 4500, 7, 3, 'active');

-- ============================================
-- SAMPLE COMPOST WORKDAYS
-- ============================================

INSERT INTO compost_workdays (worker_id, batch_id, date_worked, hours_worked, daily_wage, payment_status) VALUES
(5, 1, '2024-01-10', 8, 2500.00, 'paid'),
(5, 1, '2024-01-11', 8, 2500.00, 'paid'),
(6, 1, '2024-01-10', 6, 2500.00, 'paid'),
(5, 2, '2024-02-15', 8, 2500.00, 'pending'),
(6, 2, '2024-02-16', 8, 2500.00, 'pending');

-- ============================================
-- SAMPLE TRAINING SESSIONS
-- ============================================

INSERT INTO training_sessions (title, description, training_type, cohort_id, conducted_by, training_date, location, duration_hours) VALUES
('Compost Production Basics', 'Introduction to composting techniques', 'composting', 1, 2, '2024-01-20', 'Kigali North Community Center', 4),
('VSLA Management', 'How to manage savings and loans', 'vsla_management', 1, 5, '2024-01-25', 'Dufatanye VSLA Office', 3),
('Avocado Grafting', 'Advanced grafting techniques', 'agronomy', 1, 2, '2024-02-10', 'Cohort A Demo Farm', 6),
('Business Skills for Farmers', 'Marketing and pricing strategies', 'business_skills', 2, 4, '2024-02-15', 'Kigali South Training Hall', 4);

-- ============================================
-- SAMPLE TRAINING ATTENDANCE
-- ============================================

INSERT INTO training_attendance (session_id, farmer_id, champion_id, cascade_level) VALUES
(1, 1, NULL, 1),
(1, 2, NULL, 1),
(1, 3, NULL, 1),
(2, 1, NULL, 1),
(2, 2, NULL, 1),
(3, 1, 6, 2), -- Trained by champion
(3, 2, 6, 2);

-- ============================================
-- SAMPLE STORAGE FACILITIES
-- ============================================

INSERT INTO storage_facilities (name, type, location_coordinates, capacity_kg, user_fee_per_kg_per_week, vsla_id, manager_phone, is_active) VALUES
('Kigali North Cold Room', 'cold_room', ST_GeomFromText('POINT(30.05 -1.95)', 4326), 10000, 75.00, 1, '+250788111001', true),
('Kigali South Insulated Shed', 'insulated_shed', ST_GeomFromText('POINT(30.10 -2.05)', 4326), 5000, 50.00, 3, '+250788111002', true),
('Central Warehouse', 'warehouse', ST_GeomFromText('POINT(30.02 -1.98)', 4326), 20000, 30.00, NULL, '+250788111003', true);

-- ============================================
-- SAMPLE STORED PRODUCE
-- ============================================

INSERT INTO stored_produce (warehouse_id, farmer_id, crop_type, quantity_kg, quality_grade, stored_at, expected_duration_weeks, payment_status) VALUES
(1, 1, 'avocado', 500, 'A', '2024-03-01 08:00:00', 2, 'pending'),
(1, 2, 'avocado', 300, 'B', '2024-03-01 09:00:00', 3, 'pending'),
(2, 4, 'vegetables', 100, 'A', '2024-03-05 10:00:00', 1, 'pending');

-- Update current_usage_kg for storage facilities
UPDATE storage_facilities SET current_usage_kg = 800 WHERE id = 1;
UPDATE storage_facilities SET current_usage_kg = 100 WHERE id = 2;