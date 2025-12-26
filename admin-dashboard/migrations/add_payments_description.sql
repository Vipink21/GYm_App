-- Add missing description column to payments table
-- This fixes the error: "Could not find the 'description' column of 'payments'"

ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payments' 
AND table_schema = 'public'
ORDER BY ordinal_position;
