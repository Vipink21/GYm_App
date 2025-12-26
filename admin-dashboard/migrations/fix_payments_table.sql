-- Fix payments table - Add all missing columns
-- This fixes errors related to missing columns in the payments table

-- Add member_id column if it doesn't exist
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES public.members(id) ON DELETE SET NULL;

-- Add description column if it doesn't exist
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Verify all columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'payments'
ORDER BY ordinal_position;

-- Force schema cache refresh
SELECT * FROM public.payments LIMIT 0;

-- Success message
SELECT 'Payments table fixed! All required columns are now available.' as message;
