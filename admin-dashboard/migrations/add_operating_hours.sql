-- Add operating_hours and branch_name columns to gyms table
-- This migration adds support for storing operating hours and branch names

-- Add branch_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gyms' AND column_name = 'branch_name'
    ) THEN
        ALTER TABLE public.gyms ADD COLUMN branch_name VARCHAR(255);
    END IF;
END $$;

-- Add operating_hours column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gyms' AND column_name = 'operating_hours'
    ) THEN
        ALTER TABLE public.gyms ADD COLUMN operating_hours JSONB DEFAULT '[
            {"day": "Monday", "open": "05:00", "close": "23:00", "isOpen": true},
            {"day": "Tuesday", "open": "05:00", "close": "23:00", "isOpen": true},
            {"day": "Wednesday", "open": "05:00", "close": "23:00", "isOpen": true},
            {"day": "Thursday", "open": "05:00", "close": "23:00", "isOpen": true},
            {"day": "Friday", "open": "05:00", "close": "23:00", "isOpen": true},
            {"day": "Saturday", "open": "05:00", "close": "23:00", "isOpen": true},
            {"day": "Sunday", "open": "07:00", "close": "18:00", "isOpen": true}
        ]'::jsonb;
    END IF;
END $$;

-- Update existing gyms to have default operating hours if they don't have any
UPDATE public.gyms 
SET operating_hours = '[
    {"day": "Monday", "open": "05:00", "close": "23:00", "isOpen": true},
    {"day": "Tuesday", "open": "05:00", "close": "23:00", "isOpen": true},
    {"day": "Wednesday", "open": "05:00", "close": "23:00", "isOpen": true},
    {"day": "Thursday", "open": "05:00", "close": "23:00", "isOpen": true},
    {"day": "Friday", "open": "05:00", "close": "23:00", "isOpen": true},
    {"day": "Saturday", "open": "05:00", "close": "23:00", "isOpen": true},
    {"day": "Sunday", "open": "07:00", "close": "18:00", "isOpen": true}
]'::jsonb
WHERE operating_hours IS NULL;

-- Add comment to document the schema
COMMENT ON COLUMN public.gyms.operating_hours IS 'JSONB array storing operating hours for each day of the week. Format: [{"day": "Monday", "open": "HH:MM", "close": "HH:MM", "isOpen": boolean}]';
COMMENT ON COLUMN public.gyms.branch_name IS 'Optional branch name for gyms with multiple locations';
