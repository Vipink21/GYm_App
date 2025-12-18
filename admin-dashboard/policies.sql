-- FIX RLS POLICIES

-- 1. GYMS Table Policies
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;

-- Allow anyone authenticated to create a gym (we'll rely on app logic to limit 1 per user)
CREATE POLICY "Users can create gyms" ON gyms
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = owner_user_id);

-- Allow owners to view/manage their gym
CREATE POLICY "Owners can view own gym" ON gyms
FOR SELECT TO authenticated
USING (auth.uid() = owner_user_id);

CREATE POLICY "Owners can update own gym" ON gyms
FOR UPDATE TO authenticated
USING (auth.uid() = owner_user_id);

-- 2. USERS Table Policies (Updates)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own profile (if missing)
CREATE POLICY "Users can create own profile" ON users
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile (including setting gym_id)
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE TO authenticated
USING (auth.uid() = id);

-- 3. MEMBERSHIPS Table Policies (if not exists)
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage memberships" ON memberships
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.gym_id = memberships.gym_id
    AND users.role IN ('admin', 'superadmin')
  )
);
