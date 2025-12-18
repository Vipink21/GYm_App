-- FIX REGISTRATION SCHEMA & PERMISSIONS
-- Run this in Supabase SQL Editor

-- 1. Ensure 'gyms' table has ALL required columns
ALTER TABLE public.gyms 
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'unisex',
ADD COLUMN IF NOT EXISTS contact_no VARCHAR(20),
ADD COLUMN IF NOT EXISTS slug VARCHAR(100);

-- 2. Ensure 'users' table has 'city'
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS city VARCHAR(100);

-- 3. RLS: Allow Authenticated Users to Create a Gym
-- (The user is logged in after Step 1 of registration, so they are 'authenticated')
DROP POLICY IF EXISTS "Authenticated users can create a gym" ON public.gyms;
CREATE POLICY "Authenticated users can create a gym" ON public.gyms
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = owner_user_id);

-- 4. RLS: Allow Authenticated Users to Create a Subscription
DROP POLICY IF EXISTS "Authenticated users can create subscriptions" ON public.gym_subscriptions;
CREATE POLICY "Authenticated users can create subscriptions" ON public.gym_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.gyms 
        WHERE id = gym_subscriptions.gym_id 
        AND owner_user_id = auth.uid()
    )
);

-- 5. RLS: Update 'users' table (Add missing policy if needed for own profile update)
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
