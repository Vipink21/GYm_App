-- ================================================================
-- FIX: Infinite Recursion in Users Table RLS Policies
-- ================================================================

-- PROBLEM: 
-- The policy "users_select_same_gym" tries to query the users table 
-- to find the current user's gym_id. This query triggers the policy 
-- again, creating an infinite loop (recursion).

-- SOLUTION:
-- We use SECURITY DEFINER functions to fetch the current user's details.
-- These functions bypass RLS protections safely, preventing the loop.

-- 1. Create Helper Functions (Bypass RLS safely)
CREATE OR REPLACE FUNCTION get_my_gym_id()
RETURNS UUID 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public
STABLE
AS $$
  SELECT gym_id FROM users WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public
STABLE
AS $$
  SELECT role FROM users WHERE id = auth.uid() LIMIT 1;
$$;

-- 2. Drop Recursive Policies (and any old variations)
DROP POLICY IF EXISTS "users_select_same_gym" ON users;
DROP POLICY IF EXISTS "admins_insert_gym_members" ON users;
DROP POLICY IF EXISTS "admins_update_gym_members" ON users;
DROP POLICY IF EXISTS "users_view_same_gym" ON users;
DROP POLICY IF EXISTS "admins_create_members" ON users;
DROP POLICY IF EXISTS "admins_update_members" ON users;

-- 3. Re-create Optimized Policies

-- READ: Users can see themselves and others in their gym
CREATE POLICY "users_view_same_gym" ON users
FOR SELECT 
TO authenticated
USING (
  id = auth.uid() 
  OR gym_id = get_my_gym_id()
  OR get_my_role() = 'superadmin'
);

-- WRITE: Admins can create members in their gym
CREATE POLICY "admins_create_members" ON users
FOR INSERT 
TO authenticated
WITH CHECK (
  get_my_role() IN ('admin', 'superadmin')
  AND gym_id = get_my_gym_id()
);

-- UPDATE: Admins can update members in their gym
CREATE POLICY "admins_update_members" ON users
FOR UPDATE 
TO authenticated
USING (
  get_my_role() IN ('admin', 'superadmin')
  AND gym_id = get_my_gym_id()
);

-- DELETE: Admins can remove members
CREATE POLICY "admins_delete_members" ON users
FOR DELETE
TO authenticated
USING (
  get_my_role() IN ('admin', 'superadmin')
  AND gym_id = get_my_gym_id()
);
