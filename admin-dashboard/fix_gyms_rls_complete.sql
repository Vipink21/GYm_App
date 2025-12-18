-- COMPLETE FIX FOR GYMS RLS ERRORS
-- Run this script in Supabase SQL Editor to fix gym creation issues

-- Step 1: Temporarily disable RLS to clean up
ALTER TABLE gyms DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies on gyms table
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'gyms' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON gyms', pol.policyname);
    END LOOP;
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;

-- Step 4: Create fresh, working policies

-- Allow authenticated users to INSERT gyms where they are the owner
CREATE POLICY "allow_insert_own_gym" ON gyms
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = owner_user_id);

-- Allow users to SELECT their own gyms
CREATE POLICY "allow_select_own_gym" ON gyms
FOR SELECT 
TO authenticated
USING (auth.uid() = owner_user_id);

-- Allow users to UPDATE their own gyms
CREATE POLICY "allow_update_own_gym" ON gyms
FOR UPDATE 
TO authenticated
USING (auth.uid() = owner_user_id)
WITH CHECK (auth.uid() = owner_user_id);

-- Allow users to DELETE their own gyms
CREATE POLICY "allow_delete_own_gym" ON gyms
FOR DELETE 
TO authenticated
USING (auth.uid() = owner_user_id);

-- OPTIONAL: Uncomment if you want superadmins to manage ALL gyms
-- CREATE POLICY "superadmin_all_access" ON gyms
-- FOR ALL
-- TO authenticated
-- USING (
--   EXISTS (
--     SELECT 1 FROM users 
--     WHERE users.id = auth.uid() 
--     AND users.role = 'superadmin'
--   )
-- )
-- WITH CHECK (
--   EXISTS (
--     SELECT 1 FROM users 
--     WHERE users.id = auth.uid() 
--     AND users.role = 'superadmin'
--   )
-- );

-- Verify the policies were created
SELECT * FROM pg_policies WHERE tablename = 'gyms' AND schemaname = 'public';
