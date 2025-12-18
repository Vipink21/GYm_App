-- ================================================
-- COMPLETE SQL SCRIPT TO ALTER GYMS TABLE
-- Run this in Supabase SQL Editor
-- ================================================

-- Add Location field
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS location TEXT;

-- Add Contact Number field
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS contact_no VARCHAR(20);

-- Add Owner Name field
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255);

-- Add GYM Category field with default value
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS gym_category VARCHAR(50) DEFAULT 'Unisex';

-- Optional: Add detailed location fields (uncomment if needed)
-- ALTER TABLE gyms ADD COLUMN IF NOT EXISTS address TEXT;
-- ALTER TABLE gyms ADD COLUMN IF NOT EXISTS city VARCHAR(100);
-- ALTER TABLE gyms ADD COLUMN IF NOT EXISTS state VARCHAR(100);
-- ALTER TABLE gyms ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);
-- ALTER TABLE gyms ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India';

-- Update existing gyms to have default values
UPDATE gyms SET location = 'Not specified' WHERE location IS NULL;
UPDATE gyms SET gym_category = 'Unisex' WHERE gym_category IS NULL;

-- Verify the changes
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'gyms' 
AND table_schema = 'public'
ORDER BY ordinal_position;
