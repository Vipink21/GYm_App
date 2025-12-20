-- =====================================================
-- FIX: Ensure All Gyms Have Active Subscriptions
-- =====================================================
-- This script ensures every gym has an active subscription
-- Run this in your Supabase SQL Editor

-- Step 1: Check current subscription status
SELECT 
    g.id as gym_id,
    g.name as gym_name,
    gs.id as subscription_id,
    gs.status as subscription_status,
    sp.name as plan_name
FROM gyms g
LEFT JOIN gym_subscriptions gs ON g.id = gs.gym_id AND gs.status = 'active'
LEFT JOIN saas_plans sp ON gs.plan_id = sp.id
ORDER BY g.created_at DESC;

-- Step 2: Ensure Free Tier plan exists
INSERT INTO saas_plans (name, description, price_monthly, price_yearly, max_members_per_gym, max_trainers_per_gym, is_active)
VALUES ('Free Tier', 'Basic free plan with limited features', 0, 0, 50, 2, true)
ON CONFLICT (name) DO NOTHING;

-- Step 3: Assign Free Tier to gyms without active subscriptions
INSERT INTO gym_subscriptions (gym_id, plan_id, status, start_date, end_date)
SELECT 
    g.id,
    (SELECT id FROM saas_plans WHERE name = 'Free Tier' LIMIT 1),
    'active',
    NOW(),
    NOW() + INTERVAL '100 years'  -- Effectively permanent for free tier
FROM gyms g
WHERE NOT EXISTS (
    SELECT 1 
    FROM gym_subscriptions gs 
    WHERE gs.gym_id = g.id 
    AND gs.status = 'active'
);

-- Step 4: Verify all gyms now have active subscriptions
SELECT 
    g.id,
    g.name,
    g.owner_user_id,
    gs.status,
    sp.name as plan_name,
    gs.start_date,
    gs.end_date
FROM gyms g
LEFT JOIN gym_subscriptions gs ON g.id = gs.gym_id AND gs.status = 'active'
LEFT JOIN saas_plans sp ON gs.plan_id = sp.id
ORDER BY g.created_at DESC;

-- =====================================================
-- OPTIONAL: Upgrade Specific Gyms to Paid Plans
-- =====================================================

-- Example: Upgrade "Muscle Hut" to Enterprise plan
-- UPDATE gym_subscriptions 
-- SET plan_id = (SELECT id FROM saas_plans WHERE name = 'Enterprise' LIMIT 1)
-- WHERE gym_id = (SELECT id FROM gyms WHERE name = 'Muscle Hut' LIMIT 1)
-- AND status = 'active';

-- Example: Upgrade "Arnold GYM" to Professional plan
-- UPDATE gym_subscriptions 
-- SET plan_id = (SELECT id FROM saas_plans WHERE name = 'Professional' LIMIT 1)
-- WHERE gym_id = (SELECT id FROM gyms WHERE name = 'Arnold GYM' LIMIT 1)
-- AND status = 'active';
