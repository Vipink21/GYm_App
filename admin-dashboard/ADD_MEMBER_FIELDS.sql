-- Add storage for Member Plan and Trainer Name on the users table
-- Run this in Supabase SQL Editor

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS member_plan VARCHAR(100),
ADD COLUMN IF NOT EXISTS trainer_name VARCHAR(100);

-- Optional: Update existing records to have defaults if needed
UPDATE public.users 
SET member_plan = 'Gold Annual' 
WHERE role = 'member' AND member_plan IS NULL;
