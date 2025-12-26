-- Comprehensive fix for membership_plans table
-- This handles the duration column issue

DO $$ 
BEGIN
    -- Check if duration_days exists and rename it to duration_months
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'membership_plans' 
        AND column_name = 'duration_days'
    ) THEN
        -- Rename duration_days to duration_months
        ALTER TABLE public.membership_plans 
        RENAME COLUMN duration_days TO duration_months;
        
        RAISE NOTICE 'Renamed duration_days to duration_months';
        
    -- If duration_days doesn't exist, check if duration_months exists
    ELSIF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'membership_plans' 
        AND column_name = 'duration_months'
    ) THEN
        -- Add duration_months column
        ALTER TABLE public.membership_plans 
        ADD COLUMN duration_months INTEGER NOT NULL DEFAULT 1;
        
        RAISE NOTICE 'Added duration_months column';
    ELSE
        RAISE NOTICE 'duration_months column already exists';
    END IF;
END $$;

-- Verify the final structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'membership_plans'
ORDER BY ordinal_position;
