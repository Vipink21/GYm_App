-- FIX ROLE CHECK CONSTRAINT
-- Run this in Supabase SQL Editor to allow 'gym_owner' role

-- 1. Drop existing check constraint if it exists
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Add updated check constraint including 'gym_owner'
ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('member', 'trainer', 'admin', 'superadmin', 'gym_owner'));

-- 3. Just in case, grant permissions (this part is usually not the blocker for check constraints, but good practice)
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;
