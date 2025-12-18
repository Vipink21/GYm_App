-- ============================================
-- REMOVE HINDI TEXT FROM PLAN DESCRIPTIONS
-- Run this in Supabase SQL Editor
-- ============================================

-- Update Free Plan - Remove "छोटे जिम के लिए बिल्कुल मुफ्त"
UPDATE saas_plans 
SET description = 'Perfect for getting started'
WHERE name = 'Free';

-- Update Basic Plan - Remove "छोटे और मध्यम जिम के लिए आदर्श"
UPDATE saas_plans 
SET description = 'Ideal for small and medium gyms'
WHERE name = 'Basic';

-- Update Pro Plan - Remove "बढ़ते हुए जिम व्यवसाय के लिए श्रेष्ठ"
UPDATE saas_plans 
SET description = 'Best for growing gym businesses'
WHERE name = 'Pro';

-- Update Enterprise Plan - Remove "जिम चेन और फ्रेंचाइजी के लिए"
UPDATE saas_plans 
SET description = 'For gym chains and franchises'
WHERE name = 'Enterprise';

-- Verify the changes
SELECT name, description, price_monthly FROM saas_plans ORDER BY price_monthly;
