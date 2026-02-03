-- VSLA Groups table
CREATE TABLE IF NOT EXISTS vsla_groups (
  id SERIAL PRIMARY KEY,
  cohort_id INTEGER REFERENCES cohorts(id),
  name VARCHAR(100) NOT NULL,
  seed_capital DECIMAL(10,2) DEFAULT 12000, -- €10 = RWF 12,000
  maintenance_fund DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- VSLA Members table
CREATE TABLE IF NOT EXISTS vsla_members (
  id SERIAL PRIMARY KEY,
  vsla_id INTEGER REFERENCES vsla_groups(id),
  farmer_id INTEGER REFERENCES farmers(id),
  role VARCHAR(50) CHECK (role IN ('chair', 'treasurer', 'secretary', 'loan_officer', 'auditor', 'member')),
  opening_savings DECIMAL(10,2) DEFAULT 12000, -- €10 seed capital
  current_balance DECIMAL(10,2) DEFAULT 12000,
  joined_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- VSLA Transactions table
CREATE TABLE IF NOT EXISTS vsla_transactions (
  id SERIAL PRIMARY KEY,
  vsla_id INTEGER REFERENCES vsla_groups(id),
  member_id INTEGER REFERENCES vsla_members(id),
  type VARCHAR(50) CHECK (type IN ('savings', 'loan_disbursement', 'loan_repayment', 'stipend', 'maintenance_expense', 'input_repayment')),
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2),
  description TEXT,
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW()
);

-- VSLA Constitutions table
CREATE TABLE IF NOT EXISTS vsla_constitutions (
  id SERIAL PRIMARY KEY,
  vsla_id INTEGER REFERENCES vsla_groups(id),
  content TEXT NOT NULL, -- JSON or text
  version VARCHAR(20) DEFAULT '1.0',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Officer Rotation History
CREATE TABLE IF NOT EXISTS vsla_officer_history (
  id SERIAL PRIMARY KEY,
  vsla_id INTEGER REFERENCES vsla_groups(id),
  member_id INTEGER REFERENCES vsla_members(id),
  role VARCHAR(50),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
