-- ROBUST SUPER ADMIN RLS FIX
-- Run this in Supabase SQL Editor to ensure Super Admins (both 'superadmin' and 'super_admin') can see all data

-- 1. Correct GYMS Table Policies
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Superadmin select all gyms" ON public.gyms;
DROP POLICY IF EXISTS "Superadmin delete any gym" ON public.gyms;

CREATE POLICY "Superadmin select all gyms" ON public.gyms
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND (role = 'superadmin' OR role = 'super_admin')
  )
);

CREATE POLICY "Superadmin delete any gym" ON public.gyms
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND (role = 'superadmin' OR role = 'super_admin')
  )
);

-- 2. Correct USERS Table Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Superadmin select all users" ON public.users;

CREATE POLICY "Superadmin select all users" ON public.users
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND (role = 'superadmin' OR role = 'super_admin')
  )
);

-- 3. Correct GYM_SUBSCRIPTIONS Table Policies
ALTER TABLE public.gym_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Superadmin select all subs" ON public.gym_subscriptions;

CREATE POLICY "Superadmin select all subs" ON public.gym_subscriptions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND (role = 'superadmin' OR role = 'super_admin')
  )
);

-- 4. Correct SAAS_PLANS Table Policies (Already public/auth, but good to have)
ALTER TABLE public.saas_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Superadmin manage all plans" ON public.saas_plans;

CREATE POLICY "Superadmin manage all plans" ON public.saas_plans
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND (role = 'superadmin' OR role = 'super_admin')
  )
);

-- 5. Final verification check: Ensure the user 'admin@fitzone.com' actually has the superadmin role
UPDATE public.users 
SET role = 'superadmin' 
WHERE email = 'admin@fitzone.com';
