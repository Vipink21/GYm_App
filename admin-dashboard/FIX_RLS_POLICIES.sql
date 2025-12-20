-- =====================================================
-- FIX: Row Level Security (RLS) Policies
-- =====================================================
-- The frontend cannot fetch subscription data because RLS is blocking it
-- Run this in Supabase SQL Editor

-- Step 1: Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('gym_subscriptions', 'saas_plans')
ORDER BY tablename, policyname;

-- Step 2: Temporarily disable RLS to test (DEVELOPMENT ONLY!)
ALTER TABLE gym_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE saas_plans DISABLE ROW LEVEL SECURITY;

-- After disabling, refresh your dashboard and check if plans show correctly
-- If they do, the issue is confirmed to be RLS policies

-- Step 3: Create proper RLS policies for Super Admin access
-- First, drop existing policies if any
DROP POLICY IF EXISTS "Super admins can view all subscriptions" ON gym_subscriptions;
DROP POLICY IF EXISTS "Super admins can view all plans" ON saas_plans;
DROP POLICY IF EXISTS "Gym owners can view their subscriptions" ON gym_subscriptions;
DROP POLICY IF EXISTS "Everyone can view active plans" ON saas_plans;

-- Step 4: Create new policies

-- Allow super admins to view all subscriptions
CREATE POLICY "Super admins can view all subscriptions"
ON gym_subscriptions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_super_admin = true
    )
);

-- Allow gym owners to view their own gym's subscriptions
CREATE POLICY "Gym owners can view their subscriptions"
ON gym_subscriptions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM gyms
        WHERE gyms.id = gym_subscriptions.gym_id
        AND gyms.owner_user_id = auth.uid()
    )
);

-- Allow everyone to view active SaaS plans (public pricing)
CREATE POLICY "Everyone can view active plans"
ON saas_plans FOR SELECT
USING (is_active = true);

-- Allow super admins to view all plans (including inactive)
CREATE POLICY "Super admins can view all plans"
ON saas_plans FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_super_admin = true
    )
);

-- Step 5: Re-enable RLS
ALTER TABLE gym_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_plans ENABLE ROW LEVEL SECURITY;

-- Step 6: Verify policies are active
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('gym_subscriptions', 'saas_plans')
ORDER BY tablename, policyname;

-- Step 7: Test query as super admin
-- This should return subscription data
SELECT 
    g.name,
    gs.status,
    sp.name as plan_name
FROM gyms g
LEFT JOIN gym_subscriptions gs ON g.id = gs.gym_id
LEFT JOIN saas_plans sp ON gs.plan_id = sp.id
WHERE gs.status = 'active';
