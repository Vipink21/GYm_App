-- ============================================
-- REMOVE ALL HINDI TEXT FROM PLANS
-- Update descriptions and features to English only
-- ============================================

-- Update Free Plan
UPDATE saas_plans 
SET 
    description = 'Perfect for getting started',
    features = '["Basic Dashboard", "Member Management (up to 50)", "Attendance Tracking", "Basic Reports", "WhatsApp Support"]'::jsonb
WHERE name = 'Free';

-- Update Basic Plan
UPDATE saas_plans 
SET 
    description = 'Ideal for small and medium gyms',
    features = '["Everything in Free", "Member Management (up to 200)", "Trainer Management (up to 5)", "Class Scheduling", "Payment Tracking", "SMS Notifications", "Email Support"]'::jsonb
WHERE name = 'Basic';

-- Update Pro Plan
UPDATE saas_plans 
SET 
    description = 'Best for growing gym businesses',
    features = '["Everything in Basic", "Multi-Location (up to 3 gyms)", "Member Management (up to 1000)", "WhatsApp Notifications", "SMS & Email Notifications", "Advanced Analytics", "Custom Reports", "UPI Payment Integration", "Priority Support"]'::jsonb
WHERE name = 'Pro';

-- Update Enterprise Plan
UPDATE saas_plans 
SET 
    description = 'For gym chains and franchises',
    features = '["Everything in Pro", "Unlimited Locations", "Unlimited Members", "Unlimited Trainers", "Custom Branding", "API Access", "Dedicated Account Manager", "24/7 Priority Support", "Custom Integrations", "Razorpay/PhonePe Integration"]'::jsonb
WHERE name = 'Enterprise';

-- Verify the changes
SELECT 
    name AS "Plan Name",
    description AS "Description",
    CONCAT('₹', price_monthly) AS "Monthly Price",
    CONCAT('₹', price_yearly) AS "Yearly Price"
FROM saas_plans 
ORDER BY price_monthly;

-- Show features for verification
SELECT 
    name,
    features
FROM saas_plans
ORDER BY price_monthly;
