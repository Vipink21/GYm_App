-- =====================================================
-- TEST QUERY: Verify Subscription Data
-- =====================================================
-- Run this in Supabase SQL Editor to verify the data structure

-- Step 1: Check what the frontend query should return
SELECT 
    g.id as gym_id,
    g.name as gym_name,
    json_agg(
        json_build_object(
            'id', gs.id,
            'status', gs.status,
            'plan_id', gs.plan_id,
            'saas_plans', json_build_object(
                'id', sp.id,
                'name', sp.name
            )
        )
    ) as gym_subscriptions
FROM gyms g
LEFT JOIN gym_subscriptions gs ON g.id = gs.gym_id
LEFT JOIN saas_plans sp ON gs.plan_id = sp.id
GROUP BY g.id, g.name
ORDER BY g.created_at DESC;

-- Step 2: Verify active subscriptions only
SELECT 
    g.name as gym_name,
    gs.status,
    sp.name as plan_name,
    gs.created_at
FROM gyms g
LEFT JOIN gym_subscriptions gs ON g.id = gs.gym_id AND gs.status = 'active'
LEFT JOIN saas_plans sp ON gs.plan_id = sp.id
ORDER BY g.created_at DESC;

-- Step 3: Check if plan_id matches actual plan IDs
SELECT 
    'Gym Subscriptions' as table_name,
    gs.id,
    gs.gym_id,
    gs.plan_id,
    gs.status
FROM gym_subscriptions gs
UNION ALL
SELECT 
    'SaaS Plans' as table_name,
    sp.id,
    NULL as gym_id,
    NULL as plan_id,
    sp.name as status
FROM saas_plans sp
ORDER BY table_name, id;
