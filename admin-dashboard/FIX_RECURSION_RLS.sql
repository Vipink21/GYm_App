-- FIX: RECURSIVE RLS POLICIES
-- Run this in Supabase SQL Editor to solve the "Infinite Recursion" error

-- 1. Create a SECURITY DEFINER helper function to check roles
-- This function runs with higher privileges, bypassing the RLS recursion
CREATE OR REPLACE FUNCTION public.check_is_superadmin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id AND (role = 'superadmin' OR role = 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Update USERS Table Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Superadmin select all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Users can always see their own profile
CREATE POLICY "Users can view own profile" ON public.users
FOR SELECT USING (auth.uid() = id);

-- Superadmins can see EVERYTHING
CREATE POLICY "Superadmin select all users" ON public.users
FOR SELECT USING (public.check_is_superadmin(auth.uid()));

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE USING (auth.uid() = id);

-- 3. Update GYMS Table Policies
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own gym" ON public.gyms;
DROP POLICY IF EXISTS "Superadmin select all gyms" ON public.gyms;
DROP POLICY IF EXISTS "Allow Gym Creation" ON public.gyms;

CREATE POLICY "Users can view own gym" ON public.gyms
FOR SELECT USING (auth.uid() = owner_user_id);

CREATE POLICY "Superadmin select all gyms" ON public.gyms
FOR SELECT USING (public.check_is_superadmin(auth.uid()));

CREATE POLICY "Allow Gym Creation" ON public.gyms
FOR INSERT TO authenticated WITH CHECK (true);

-- 4. Update GYM_SUBSCRIPTIONS Table Policies
ALTER TABLE public.gym_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own sub" ON public.gym_subscriptions;
DROP POLICY IF EXISTS "Superadmin select all subs" ON public.gym_subscriptions;

CREATE POLICY "Users can view own sub" ON public.gym_subscriptions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.gyms 
    WHERE id = gym_subscriptions.gym_id AND owner_user_id = auth.uid()
  )
);

CREATE POLICY "Superadmin select all subs" ON public.gym_subscriptions
FOR SELECT USING (public.check_is_superadmin(auth.uid()));
