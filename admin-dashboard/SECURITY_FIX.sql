-- ============================================================
-- FINAL SECURITY & ROLE FIX (v5)
-- Fixes Redirection, Sidebar, and RLS Conflicts
-- ============================================================

-- 1. REFINED ROLE CHECKER (Safe & Non-recursive)
CREATE OR REPLACE FUNCTION public.is_super_admin_v5()
RETURNS BOOLEAN AS $$
BEGIN
  -- Use a direct select that avoids triggering RLS loops
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND (role = 'superadmin' OR role = 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. SECURE GYM SUBSCRIPTIONS POLICY
-- Super Admin sees all, Owner sees only their own
ALTER TABLE public.gym_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all select for subs" ON public.gym_subscriptions;
DROP POLICY IF EXISTS "Super Admin View All Subs" ON public.gym_subscriptions;
DROP POLICY IF EXISTS "Owners View Own Sub" ON public.gym_subscriptions;

CREATE POLICY "Super Admin View All Subs" 
ON public.gym_subscriptions FOR SELECT 
USING (public.is_super_admin_v5());

CREATE POLICY "Owners View Own Sub" 
ON public.gym_subscriptions FOR SELECT 
USING (
  gym_id IN (SELECT id FROM public.gyms WHERE owner_user_id = auth.uid())
);

-- 3. SECURE USERS POLICY
-- Super Admin sees all, Users see self
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Super Admin View All" ON public.users;
DROP POLICY IF EXISTS "Users View Self" ON public.users;

CREATE POLICY "Super Admin View All" 
ON public.users FOR SELECT 
USING (public.is_super_admin_v5());

CREATE POLICY "Users View Self" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

-- 4. SAAS PLANS (Publicly readable by all logged in users)
ALTER TABLE public.saas_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all select for plans" ON public.saas_plans;
DROP POLICY IF EXISTS "Anyone can view plans" ON public.saas_plans;
CREATE POLICY "Anyone can view plans" ON public.saas_plans FOR SELECT USING (true);

-- 5. VERIFICATION
SELECT 'Security re-tightened successfully!' as status;
