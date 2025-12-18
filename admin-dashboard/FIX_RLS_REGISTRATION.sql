-- RELAXED REGISTRATION POLICIES
-- Run this in Supabase SQL Editor

-- 1. Fix GYMS Table Policy
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;

-- Drop potential conflicting policies
DROP POLICY IF EXISTS "Authenticated users can create a gym" ON public.gyms;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.gyms;
DROP POLICY IF EXISTS "Allow Gym Creation" ON public.gyms;

-- Create a simpler permitted policy
CREATE POLICY "Allow Gym Creation" ON public.gyms
FOR INSERT
TO authenticated
WITH CHECK (true); -- Allows the insert as long as user is logged in

-- 2. Fix GYM_SUBSCRIPTIONS Table Policy
DROP POLICY IF EXISTS "Authenticated users can create subscriptions" ON public.gym_subscriptions;

CREATE POLICY "Allow Subscription Creation" ON public.gym_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (true); -- Allows insert so the registration flow doesn't break here either

-- 3. Fix USERS Table Update Policy (Profile Update)
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id);
