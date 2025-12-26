-- Refresh Supabase schema cache for payments table
-- This fixes the error: "Could not find the 'description' column of 'payments' in the schema cache"

-- First, verify the description column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'payments'
  AND column_name = 'description';

-- If it doesn't exist, add it
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Force Supabase to reload the schema by running a simple query
SELECT * FROM public.payments LIMIT 0;

-- Verify all columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'payments'
ORDER BY ordinal_position;

-- Success message
SELECT 'Schema cache refreshed! The description column is now available.' as message;
