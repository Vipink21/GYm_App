-- Add location column to gyms table
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS location TEXT;

-- Optional: Add address, city, state, postal_code for more detailed location info
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India';

-- Update existing gyms to have a default location if needed
UPDATE gyms SET location = 'Not specified' WHERE location IS NULL;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'gyms' 
AND table_schema = 'public'
ORDER BY ordinal_position;
