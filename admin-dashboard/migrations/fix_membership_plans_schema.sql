-- Fix membership_plans table schema
-- This script checks and adds the duration_months column if it's missing

-- First, check if the table exists and its structure
DO $$ 
BEGIN
    -- Check if duration_months column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'membership_plans' 
        AND column_name = 'duration_months'
    ) THEN
        ALTER TABLE public.membership_plans 
        ADD COLUMN duration_months INTEGER NOT NULL DEFAULT 1;
        
        RAISE NOTICE 'Added duration_months column to membership_plans table';
    ELSE
        RAISE NOTICE 'duration_months column already exists';
    END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'membership_plans'
ORDER BY ordinal_position;
