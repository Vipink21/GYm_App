-- FIX RLS FOR USERS TABLE - Allow Admins to Create Members
-- Run this script in Supabase SQL Editor

-- Step 1: Drop existing conflicting policies
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- Step 2: Create new policies

-- Allow users to create their OWN profile (for registration)
CREATE POLICY "users_insert_own_profile" ON users
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow ADMINS to create members in their gym
CREATE POLICY "admins_insert_gym_members" ON users
FOR INSERT 
TO authenticated
WITH CHECK (
  -- The new user must be in the same gym as the admin
  gym_id IN (
    SELECT gym_id FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
  -- And the new user must be a member or trainer (not another admin)
  AND role IN ('member', 'trainer')
);

-- Allow users to view users in their gym
CREATE POLICY "users_select_same_gym" ON users
FOR SELECT 
TO authenticated
USING (
  gym_id IN (
    SELECT gym_id FROM users WHERE id = auth.uid()
  )
  OR auth.uid() = id  -- Can always see own profile
);

-- Allow users to update their own profile
CREATE POLICY "users_update_own_profile" ON users
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow admins to update members in their gym
CREATE POLICY "admins_update_gym_members" ON users
FOR UPDATE 
TO authenticated
USING (
  gym_id IN (
    SELECT gym_id FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
)
WITH CHECK (
  gym_id IN (
    SELECT gym_id FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Verify policies were created
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'users' 
AND schemaname = 'public'
ORDER BY policyname;
