-- ============================================================
-- CONFLICT-FREE SUPER ADMIN & GYM OWNER SYNC FIX
-- This script stops all RLS conflicts and ensures data visibility
-- ============================================================

-- 1. CLEANUP: Remove ANY previous role check functions to avoid confusion
DROP FUNCTION IF EXISTS public.check_is_superadmin(UUID);
DROP FUNCTION IF EXISTS public.check_is_superadmin_v2(UUID);
DROP FUNCTION IF EXISTS public.check_is_superadmin_v3(UUID);
DROP FUNCTION IF EXISTS public.check_is_superadmin_final(UUID);

-- 2. CREATE ROBUST ROLE CHECKER (SECURITY DEFINER bypasses RLS loops)
CREATE OR REPLACE FUNCTION public.is_super_admin(id_to_check UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = id_to_check AND (role = 'superadmin' OR role = 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. RESET POLICIES (Start fresh to avoid conflicts)
-- This clears all SELECT/ALL policies to ensure we apply the new ones cleanly
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('gyms', 'users', 'gym_subscriptions'))
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 4. APPLY CLEAN POLICIES - USERS TABLE
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super Admin View All" ON public.users FOR SELECT USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super Admin Manage All" ON public.users FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Users View Self" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users Update Self" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 5. APPLY CLEAN POLICIES - GYMS TABLE
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super Admin View All Gyms" ON public.gyms FOR SELECT USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super Admin Manage All Gyms" ON public.gyms FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Owners View Own Gym" ON public.gyms FOR SELECT USING (owner_user_id = auth.uid());
CREATE POLICY "Public Read Gyms" ON public.gyms FOR SELECT USING (true); -- Required for registration/discovery

-- 6. APPLY CLEAN POLICIES - SUBSCRIPTIONS
ALTER TABLE public.gym_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super Admin View All Subs" ON public.gym_subscriptions FOR SELECT USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Owners View Own Sub" ON public.gym_subscriptions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.gyms WHERE id = gym_subscriptions.gym_id AND owner_user_id = auth.uid())
);

-- 7. SELF-HEALING: FIX MISSING GYM RECORDS
-- If a 'gym_owner' exists in 'users' but doesn't have a record in 'gyms', this creates it.
-- This is the most likely reason why only 1 is showing!
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

-- 8. LINK GYM_ID BACK TO USERS
-- Ensures the users table is correctly linked to the gyms table
UPDATE public.users u
SET gym_id = g.id
FROM public.gyms g
WHERE g.owner_user_id = u.id
AND (u.gym_id IS NULL OR u.gym_id != g.id);

-- 9. ENSURE ADMIN ROLE IS CORRECT
UPDATE public.users SET role = 'superadmin' WHERE email = 'admin@fitzone.com';

-- 10. VERIFY DATA
SELECT count(*) as total_gyms FROM gyms;
SELECT count(*) as total_owners FROM users WHERE role = 'gym_owner';
