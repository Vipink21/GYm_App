-- ============================================================
-- THE "LOOP-BREAKER" RLS FIX (v4)
-- This fixes the "No Plan" issue permanently by removing RLS loops
-- ============================================================

-- 1. Create a function that bypasses RLS entirely for checking roles
-- This is a "Security Definer" function that runs as the database owner
CREATE OR REPLACE FUNCTION public.is_super_admin_v4()
RETURNS BOOLEAN AS $$
DECLARE
  current_role TEXT;
BEGIN
  -- We fetch the role directly from the users table. 
  -- Because this function is SECURITY DEFINER, it doesn't trigger the user's RLS policies.
  SELECT role INTO current_role 
  FROM public.users 
  WHERE id = auth.uid();
  
  RETURN (current_role = 'superadmin' OR current_role = 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RE-APPLY POLICIES TO ALL RELEVANT TABLES
-- We drop old policies and use the new non-recursive function

-- -- GYM_SUBSCRIPTIONS -- --
ALTER TABLE public.gym_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Super Admin View All Subs" ON public.gym_subscriptions;
CREATE POLICY "Super Admin View All Subs" ON public.gym_subscriptions 
FOR SELECT USING (public.is_super_admin_v4());

-- -- SAAS_PLANS -- --
ALTER TABLE public.saas_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view plans" ON public.saas_plans;
CREATE POLICY "Anyone can view plans" ON public.saas_plans 
FOR SELECT USING (true); -- Plans should be readable by all authenticated users

-- -- USERS -- --
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Super Admin View All" ON public.users;
CREATE POLICY "Super Admin View All" ON public.users 
FOR SELECT USING (public.is_super_admin_v4());

-- -- GYMS -- --
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Super Admin View All Gyms" ON public.gyms;
CREATE POLICY "Super Admin View All Gyms" ON public.gyms 
FOR SELECT USING (public.is_super_admin_v4());

-- 3. FINAL VALIDATION (Check if the join works under system privileges)
-- If this shows 'Free', the data is fine and only RLS was blocking it.
SELECT g.name as gym_name, p.name as plan_name
FROM gyms g
LEFT JOIN gym_subscriptions s ON g.id = s.gym_id
LEFT JOIN saas_plans p ON s.plan_id = p.id;
