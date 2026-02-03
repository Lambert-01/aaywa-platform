-- Database Setup for AAYWA Platform (Email/Password Auth)

-- 1. Clean up existing tables
DROP TABLE IF EXISTS users CASCADE;

-- 2. Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('project_manager', 'agronomist', 'field_facilitator')),
  language VARCHAR(10) DEFAULT 'en',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- 3. Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 4. Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Seed Admin User
-- Email: admin@aaywa.rw
-- Password: AdminPass123!
INSERT INTO users (full_name, email, password_hash, role, language, is_active) 
VALUES 
('System Administrator', 'admin@aaywa.rw', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIw8YJHztC', 'project_manager', 'en', true);

-- Success Message
SELECT 'Database setup complete. Admin user created.' as status;
