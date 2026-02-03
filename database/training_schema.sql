-- Training Management System Schema
-- Project AAYWA - Training & Capacity Building Tables

-- Training Sessions Table
CREATE TABLE IF NOT EXISTS training_sessions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  cohort_id INTEGER REFERENCES cohorts(id),
  trainer_id INTEGER REFERENCES users(id),
  session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('Master Training', 'Champion Training', 'VSLA', 'Nutrition', 'Agronomy')),
  date TIMESTAMP NOT NULL,
  duration_hours DECIMAL(3,1) NOT NULL DEFAULT 2.0,
  location VARCHAR(200) NOT NULL,
  childcare_provided BOOLEAN DEFAULT false,
  materials JSONB DEFAULT '[]'::jsonb,
  expected_attendees INTEGER DEFAULT 0,
  actual_attendees INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Training Attendance Records Table
CREATE TABLE IF NOT EXISTS training_attendance (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES training_sessions(id) ON DELETE CASCADE,
  farmer_id INTEGER REFERENCES farmers(id),
  attendance_status VARCHAR(20) DEFAULT 'present' CHECK (attendance_status IN ('present', 'absent', 'late')),
  check_in_method VARCHAR(20) DEFAULT 'manual' CHECK (check_in_method IN ('mobile_app', 'ussd', 'manual')),
  check_in_time TIMESTAMP,
  childcare_used BOOLEAN DEFAULT false,
  feedback_score INTEGER CHECK (feedback_score BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES training_sessions(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  passing_score DECIMAL(5,2) DEFAULT 70.00,
  total_points INTEGER DEFAULT 10,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Quiz Questions Table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- {"A": "Option 1", "B": "Option 2", "C": "Option 3"}
  correct_answer VARCHAR(10) NOT NULL,
  points INTEGER DEFAULT 1,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quiz Results Table
CREATE TABLE IF NOT EXISTS quiz_results (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  farmer_id INTEGER REFERENCES farmers(id),
  score DECIMAL(5,2) NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL, -- {"Q1": "A", "Q2": "B"}
  submission_method VARCHAR(20) DEFAULT 'mobile_app' CHECK (submission_method IN ('mobile_app', 'ussd', 'manual')),
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- Learning Materials Table
CREATE TABLE IF NOT EXISTS learning_materials (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Agronomy', 'VSLA', 'Nutrition', 'Compost', 'Business Skills')),
  file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('PDF', 'Video', 'Audio', 'Image')),
  file_url VARCHAR(255) NOT NULL,
  version VARCHAR(20) DEFAULT '1.0',
  description TEXT,
  download_count INTEGER DEFAULT 0,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Champion Records Table
CREATE TABLE IF NOT EXISTS champions (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER REFERENCES farmers(id) UNIQUE,
  cohort_id INTEGER REFERENCES cohorts(id),
  certified_date DATE NOT NULL,
  peers_assigned INTEGER DEFAULT 0,
  peers_trained INTEGER DEFAULT 0,
  sessions_led INTEGER DEFAULT 0,
  avg_attendance_rate DECIMAL(5,2) DEFAULT 0.00,
  avg_feedback_score DECIMAL(3,2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_training_sessions_cohort_date ON training_sessions(cohort_id, date);
CREATE INDEX IF NOT EXISTS idx_training_sessions_trainer ON training_sessions(trainer_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_status ON training_sessions(status);
CREATE INDEX IF NOT EXISTS idx_training_sessions_date ON training_sessions(date);
CREATE INDEX IF NOT EXISTS idx_training_attendance_session_farmer ON training_attendance(session_id, farmer_id);
CREATE INDEX IF NOT EXISTS idx_training_attendance_farmer ON training_attendance(farmer_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_farmer_score ON quiz_results(farmer_id, score);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz ON quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_learning_materials_category ON learning_materials(category);
CREATE INDEX IF NOT EXISTS idx_champions_farmer ON champions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_champions_cohort ON champions(cohort_id);

-- Update updated_at timestamp trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_training_sessions_updated_at ON training_sessions;
CREATE TRIGGER update_training_sessions_updated_at BEFORE UPDATE ON training_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quizzes_updated_at ON quizzes;
CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_learning_materials_updated_at ON learning_materials;
CREATE TRIGGER update_learning_materials_updated_at BEFORE UPDATE ON learning_materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_champions_updated_at ON champions;
CREATE TRIGGER update_champions_updated_at BEFORE UPDATE ON champions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View for Training Session Summary
CREATE OR REPLACE VIEW training_session_summary AS
SELECT 
  ts.id,
  ts.title,
  ts.cohort_id,
  c.name as cohort_name,
  ts.trainer_id,
  u.full_name as trainer_name,
  ts.session_type,
  ts.date,
  ts.duration_hours,
  ts.location,
  ts.childcare_provided,
  ts.materials,
  ts.expected_attendees,
  ts.actual_attendees,
  CASE 
    WHEN ts.expected_attendees > 0 
    THEN ROUND((ts.actual_attendees::DECIMAL / ts.expected_attendees * 100), 2)
    ELSE 0
  END as attendance_rate,
  ts.status,
  ts.notes,
  ts.created_at,
  ts.updated_at,
  COUNT(DISTINCT ta.id) as attendance_records,
  AVG(ta.feedback_score) as avg_feedback
FROM training_sessions ts
LEFT JOIN cohorts c ON ts.cohort_id = c.id
LEFT JOIN users u ON ts.trainer_id = u.id
LEFT JOIN training_attendance ta ON ts.id = ta.session_id
GROUP BY ts.id, c.name, u.full_name;

-- View for Participant Training Stats
CREATE OR REPLACE VIEW participant_training_stats AS
SELECT 
  f.id as farmer_id,
  f.full_name as farmer_name,
  f.cohort_id,
  f.phone,
  COUNT(DISTINCT CASE WHEN ta.attendance_status = 'present' THEN ta.session_id END) as sessions_attended,
  COUNT(DISTINCT ta.session_id) as total_sessions_scheduled,
  ROUND(AVG(CASE WHEN ta.attendance_status = 'present' THEN 100.0 ELSE 0.0 END), 2) as attendance_rate,
  COUNT(DISTINCT qr.id) as quizzes_taken,
  ROUND(AVG(qr.score), 2) as avg_quiz_score,
  COUNT(DISTINCT CASE WHEN qr.passed = true THEN qr.id END) as quizzes_passed,
  MAX(ta.created_at) as last_activity,
  CASE 
    WHEN ch.id IS NOT NULL THEN 'Champion'
    ELSE 'Farmer'
  END as role
FROM farmers f
LEFT JOIN training_attendance ta ON f.id = ta.farmer_id
LEFT JOIN quiz_results qr ON f.id = qr.farmer_id
LEFT JOIN champions ch ON f.id = ch.farmer_id
GROUP BY f.id, f.full_name, f.cohort_id, f.phone, ch.id;
