-- FINAL FIX FOR SUPER ADMIN DATA VISIBILITY
-- Run this in Supabase SQL Editor to fix the "only 1 gym showing" issue

-- 1. Create a recursion-proof role check function
CREATE OR REPLACE FUNCTION public.check_is_superadmin_v3(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- SECURITY DEFINER makes this run as postgres, bypassing RLS recursion
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id AND (role = 'superadmin' OR role = 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Apply to GYMS table
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Superadmin select all gyms" ON public.gyms;
DROP POLICY IF EXISTS "Superadmin delete any gym" ON public.gyms;

CREATE POLICY "Superadmin select all gyms" ON public.gyms
FOR SELECT USING (public.check_is_superadmin_v3(auth.uid()));

CREATE POLICY "Superadmin manage all gyms" ON public.gyms
FOR ALL USING (public.check_is_superadmin_v3(auth.uid()));

-- 3. Apply to USERS table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Superadmin select all users" ON public.users;
DROP POLICY IF EXISTS "Superadmin manage all users" ON public.users;

CREATE POLICY "Superadmin select all users" ON public.users
FOR SELECT USING (public.check_is_superadmin_v3(auth.uid()));

-- Important: Super Admin must be able to update roles
CREATE POLICY "Superadmin manage all users" ON public.users
FOR ALL USING (public.check_is_superadmin_v3(auth.uid()));

-- 4. Apply to SUBSCRIPTIONS table
ALTER TABLE public.gym_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Superadmin select all subs" ON public.gym_subscriptions;
CREATE POLICY "Superadmin select all subs" ON public.gym_subscriptions
FOR SELECT USING (public.check_is_superadmin_v3(auth.uid()));

-- 5. DIAGNOSTIC CHECK (Run this after running the above to see what's actually in your DB)
-- SELECT count(*) as total_gyms_in_db FROM gyms;
-- SELECT count(*) as users_with_gym_owner_role FROM users WHERE role = 'gym_owner';
