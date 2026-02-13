-- Create a test farmer user account
-- This script creates a user with role 'farmer' and links it to a farmer record

-- First, let's create a user account for a farmer
-- Password: farmer123 (hashed with bcrypt)
INSERT INTO users (full_name, email, password, role, phone, language, created_at, updated_at)
VALUES (
  'Jean Claude Mugabo',
  'farmer@aaywa.rw',
  '$2a$10$YourHashedPasswordHere', -- This will be updated with proper hash
  'farmer',
  '+250788123456',
  'en',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Get the user ID we just created
DO $$
DECLARE
    v_user_id INTEGER;
    v_farmer_id INTEGER;
BEGIN
    -- Get the user ID
    SELECT id INTO v_user_id FROM users WHERE email = 'farmer@aaywa.rw';
    
    -- Get or create a farmer record
    -- First, check if there's a farmer without a user_id
    SELECT id INTO v_farmer_id 
    FROM farmers 
    WHERE user_id IS NULL 
    LIMIT 1;
    
    -- If we found an unlinked farmer, link it
    IF v_farmer_id IS NOT NULL THEN
        UPDATE farmers 
        SET user_id = v_user_id,
            trust_score = 75  -- Give a decent trust score for testing
        WHERE id = v_farmer_id;
    ELSE
        -- If no unlinked farmer exists, create a new one
        -- (This assumes you have a cohort with ID 1)
        INSERT INTO farmers (
            full_name,
            phone_number,
            national_id,
            gender,
            date_of_birth,
            village,
            cell,
            sector,
            district,
            province,
            cohort_id,
            household_type,
            cropping_system,
            total_land_size_ha,
            user_id,
            trust_score,
            created_at,
            updated_at
        ) VALUES (
            'Jean Claude Mugabo',
            '+250788123456',
            '1198012345678901',
            'male',
            '1990-05-15',
            'Gahinga',
            'Kimihurura',
            'Gasabo',
            'Kigali',
            'Kigali City',
            1,  -- Assuming cohort 1 exists
            'normal',
            'avocado',
            0.5,
            v_user_id,
            75,
            NOW(),
            NOW()
        );
    END IF;
END $$;

-- Verify the creation
SELECT 
    u.id as user_id,
    u.email,
    u.role,
    f.id as farmer_id,
    f.full_name,
    f.trust_score
FROM users u
LEFT JOIN farmers f ON f.user_id = u.id
WHERE u.email = 'farmer@aaywa.rw';
