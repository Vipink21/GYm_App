-- Helper function to get current user's role/gym without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_my_claims()
RETURNS table (claim_role varchar, claim_gym_id uuid) 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT role, gym_id FROM users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop old recursive policies to clear the slate
DROP POLICY IF EXISTS "Admins can view gym members" ON users;
DROP POLICY IF EXISTS "Admins can manage members" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users; 
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "View own profile" ON users;
DROP POLICY IF EXISTS "Update own profile" ON users;
DROP POLICY IF EXISTS "Insert own profile" ON users;
DROP POLICY IF EXISTS "View gym users" ON users;
DROP POLICY IF EXISTS "Manage gym users" ON users;


-- 1. Users can see/edit their own profile
CREATE POLICY "View own profile" ON users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Update own profile" ON users
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Insert own profile" ON users
FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Admins/Trainers can see users in their Gym
CREATE POLICY "View gym users" ON users
FOR SELECT USING (
  gym_id IN (select claim_gym_id from get_my_claims())
  AND (select claim_role from get_my_claims()) IN ('admin', 'superadmin', 'trainer')
);

-- 3. Admins can manage users in their Gym (Insert/Update/Delete)
CREATE POLICY "Manage gym users" ON users
FOR ALL USING (
  gym_id IN (select claim_gym_id from get_my_claims())
  AND (select claim_role from get_my_claims()) IN ('admin', 'superadmin')
);
