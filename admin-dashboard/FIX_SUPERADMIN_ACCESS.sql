-- FIX SUPER ADMIN ACCESS (RLS BYPASS)
-- Run this in Supabase SQL Editor

-- 1. GYMS Table: Allow Super Admins to see all gyms
DROP POLICY IF EXISTS "Superadmin select all gyms" ON public.gyms;
CREATE POLICY "Superadmin select all gyms" ON public.gyms
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'superadmin'
  )
);

-- 2. USERS Table: Allow Super Admins to see all owner profiles
DROP POLICY IF EXISTS "Superadmin select all users" ON public.users;
CREATE POLICY "Superadmin select all users" ON public.users
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'superadmin'
  )
);

-- 3. SUBSCRIPTIONS Table: Allow Super Admins to see all plan details
DROP POLICY IF EXISTS "Superadmin select all subs" ON public.gym_subscriptions;
CREATE POLICY "Superadmin select all subs" ON public.gym_subscriptions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'superadmin'
  )
);

-- 4. Ensure Super Admin can also DELETE gyms (for the Delete button in your dashboard)
DROP POLICY IF EXISTS "Superadmin delete any gym" ON public.gyms;
CREATE POLICY "Superadmin delete any gym" ON public.gyms
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'superadmin'
  )
);
