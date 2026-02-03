-- Migration: Create users table with enhanced security fields
-- Date: 2026-01-31
-- Description: Production-ready users table with password hashing, role-based access, and audit fields

-- Drop table if exists (for development only - remove in production)
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('project_manager', 'agronomist', 'field_facilitator', 'buyer')),
  language VARCHAR(10) DEFAULT 'rw',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (change password in production!)
-- Password: AdminPass123! (hashed with bcrypt)
INSERT INTO users (full_name, phone, email, password_hash, role) VALUES 
('System Administrator', '+250788000000', 'admin@aaywa.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIw8YJHztC', 'project_manager');

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts for AAYWA platform staff and partners';
COMMENT ON COLUMN users.role IS 'project_manager: full access, agronomist: agronomy data, field_facilitator: training/VSLA, buyer: orders only';
COMMENT ON COLUMN users.password_hash IS 'bcrypt hash with salt rounds >= 12';
