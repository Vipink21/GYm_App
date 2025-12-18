-- ============================================
-- UPDATE PLAN DESCRIPTIONS - REMOVE HINDI TEXT
-- ============================================

-- Update Free Plan
UPDATE saas_plans 
SET description = 'Perfect for getting started'
WHERE name = 'Free';

-- Update Basic Plan
UPDATE saas_plans 
SET description = 'Ideal for small and medium gyms'
WHERE name = 'Basic';

-- Update Pro Plan
UPDATE saas_plans 
SET description = 'Best for growing gym businesses'
WHERE name = 'Pro';

-- Update Enterprise Plan
UPDATE saas_plans 
SET description = 'For gym chains and franchises'
WHERE name = 'Enterprise';

-- Verify the changes
SELECT name, description, price_monthly, price_yearly 
FROM saas_plans 
ORDER BY price_monthly;
