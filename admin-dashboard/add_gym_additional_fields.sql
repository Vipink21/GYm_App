-- Add additional fields to gyms table
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS contact_no VARCHAR(20);
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255);
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS gym_category VARCHAR(50) DEFAULT 'Unisex';

-- Update existing gyms to have default values
UPDATE gyms SET gym_category = 'Unisex' WHERE gym_category IS NULL;

-- Verify the changes
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'gyms' 
AND table_schema = 'public'
ORDER BY ordinal_position;
