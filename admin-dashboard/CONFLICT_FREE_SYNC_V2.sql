-- ============================================================
-- CONFLICT-FREE SUPER ADMIN & GYM OWNER SYNC FIX (v2)
-- Using CASCADE to force-clear old dependencies
-- ============================================================

-- 1. CLEANUP: Force remove previous functions and their dependent policies
DROP FUNCTION IF EXISTS public.check_is_superadmin(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.check_is_superadmin_v2(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.check_is_superadmin_v3(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.check_is_superadmin_final(UUID) CASCADE;

-- 2. CREATE ROBUST ROLE CHECKER
CREATE OR REPLACE FUNCTION public.is_super_admin(id_to_check UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = id_to_check AND (role = 'superadmin' OR role = 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. APPLY CLEAN POLICIES - USERS TABLE
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Super Admin View All" ON public.users;
CREATE POLICY "Super Admin View All" ON public.users FOR SELECT USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super Admin Manage All" ON public.users FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Users View Self" ON public.users FOR SELECT USING (auth.uid() = id);

-- 4. APPLY CLEAN POLICIES - GYMS TABLE
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Super Admin View All Gyms" ON public.gyms;
CREATE POLICY "Super Admin View All Gyms" ON public.gyms FOR SELECT USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super Admin Manage All Gyms" ON public.gyms FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Owners View Own Gym" ON public.gyms FOR SELECT USING (owner_user_id = auth.uid());

-- 5. APPLY CLEAN POLICIES - SUBSCRIPTIONS
ALTER TABLE public.gym_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Super Admin View All Subs" ON public.gym_subscriptions;
CREATE POLICY "Super Admin View All Subs" ON public.gym_subscriptions FOR SELECT USING (public.is_super_admin(auth.uid()));

-- 6. SELF-HEALING: FIX MISSING GYM RECORDS (The "Secret" Fix)
-- This creates a Gym entry for any 'gym_owner' who doesn't have one!
INSERT INTO public.gyms (owner_user_id, name, slug, status, created_at)
SELECT 
    u.id, 
    COALESCE(u.display_name, 'New') || '''s Gym', 
    'gym-' || lower(substr(md5(random()::text), 1, 8)),
    'active',
    u.created_at
FROM public.users u
WHERE u.role = 'gym_owner'
AND NOT EXISTS (SELECT 1 FROM public.gyms WHERE owner_user_id = u.id)
ON CONFLICT DO NOTHING;

-- 7. RE-LINK USERS TO THEIR GYMS
UPDATE public.users u
SET gym_id = g.id
FROM public.gyms g
WHERE g.owner_user_id = u.id;

-- 8. FINAL VERIFICATION
SELECT 'Gyms in DB' as label, count(*) as count FROM gyms
UNION ALL
SELECT 'Owners in DB', count(*) FROM users WHERE role = 'gym_owner';
