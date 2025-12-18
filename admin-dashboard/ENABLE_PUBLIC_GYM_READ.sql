-- Allow ANYONE (including unauthenticated users) to view active gyms
-- This is required for the Registration Page dropdown to work.

-- 1. Drop existing restrictive policies if necessary (optional, usually new policy is additive)
-- DROP POLICY IF EXISTS "Anyone can view active gyms" ON gyms;

-- 2. Create the Public Read Policy
CREATE POLICY "Public can view active gyms" ON gyms
FOR SELECT 
TO anon, authenticated
USING (status = 'active');

-- Note: 'anon' role represents unlogged-in users.
