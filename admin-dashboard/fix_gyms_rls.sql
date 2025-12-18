-- Fix Row Level Security for Gyms table
-- This script resolves the "new row violates row-level security policy" error

-- Drop existing policies on gyms table
DROP POLICY IF EXISTS "Users can create gyms" ON gyms;
DROP POLICY IF EXISTS "Owners can view own gym" ON gyms;
DROP POLICY IF EXISTS "Owners can update own gym" ON gyms;
DROP POLICY IF EXISTS "Allow gym creation" ON gyms;
DROP POLICY IF EXISTS "Allow gym read" ON gyms;
DROP POLICY IF EXISTS "Allow gym update" ON gyms;
DROP POLICY IF EXISTS "Allow gym delete" ON gyms;

-- Enable RLS on gyms table
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to INSERT gyms where they are the owner
CREATE POLICY "Users can create gyms" ON gyms
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = owner_user_id);

-- Policy 2: Allow users to SELECT their own gyms
CREATE POLICY "Users can view own gym" ON gyms
FOR SELECT TO authenticated
USING (auth.uid() = owner_user_id);

-- Policy 3: Allow users to UPDATE their own gyms
CREATE POLICY "Users can update own gym" ON gyms
FOR UPDATE TO authenticated
USING (auth.uid() = owner_user_id)
WITH CHECK (auth.uid() = owner_user_id);

-- Policy 4: Allow users to DELETE their own gyms (optional, for superadmin use)
CREATE POLICY "Users can delete own gym" ON gyms
FOR DELETE TO authenticated
USING (auth.uid() = owner_user_id);

-- Optional: If you want superadmins to see ALL gyms, add this:
-- CREATE POLICY "Superadmins can view all gyms" ON gyms
-- FOR SELECT TO authenticated
-- USING (
--   EXISTS (
--     SELECT 1 FROM users 
--     WHERE users.id = auth.uid() 
--     AND users.role = 'superadmin'
--   )
-- );
