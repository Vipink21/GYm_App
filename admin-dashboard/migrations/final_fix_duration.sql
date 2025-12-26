-- Final fix: Remove duration_days column if it exists
-- Keep duration_months which is what the app expects

DO $$ 
BEGIN
    -- Check if duration_days exists and drop it
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'membership_plans' 
        AND column_name = 'duration_days'
    ) THEN
        -- First, check if duration_months exists
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'membership_plans' 
            AND column_name = 'duration_months'
        ) THEN
            -- Both exist, so drop duration_days
            ALTER TABLE public.membership_plans 
            DROP COLUMN duration_days;
            
            RAISE NOTICE 'Dropped duration_days column (duration_months already exists)';
        ELSE
            -- Only duration_days exists, rename it
            ALTER TABLE public.membership_plans 
            RENAME COLUMN duration_days TO duration_months;
            
            RAISE NOTICE 'Renamed duration_days to duration_months';
        END IF;
    ELSE
        RAISE NOTICE 'duration_days does not exist, no action needed';
    END IF;
    
    -- Ensure duration_months exists and is NOT NULL
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'membership_plans' 
        AND column_name = 'duration_months'
    ) THEN
        ALTER TABLE public.membership_plans 
        ADD COLUMN duration_months INTEGER NOT NULL DEFAULT 1;
        
        RAISE NOTICE 'Added duration_months column';
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
