-- ================================================
-- PHASE 1: SaaS SUBSCRIPTION SCHEMA
-- Complete Database Setup for Multi-Tenant SaaS Model
-- ================================================

-- ============================================
-- STEP 1: CREATE SAAS_PLANS TABLE
-- ============================================
-- This table defines the subscription tiers gym owners can choose
CREATE TABLE IF NOT EXISTS saas_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE, -- 'Free', 'Basic', 'Pro', 'Enterprise'
    description TEXT,
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2),
    max_gyms INTEGER DEFAULT 1, -- How many gym locations allowed
    max_members_per_gym INTEGER, -- NULL = unlimited
    max_trainers_per_gym INTEGER, -- NULL = unlimited
    features JSONB DEFAULT '[]'::jsonb, -- Array of feature descriptions
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 2: INSERT DEFAULT SUBSCRIPTION PLANS
-- ============================================
INSERT INTO saas_plans (name, description, price_monthly, price_yearly, max_gyms, max_members_per_gym, max_trainers_per_gym, features) VALUES
('Free', 'Perfect for getting started with your gym', 0, 0, 1, 50, 2, 
 '["Basic Dashboard", "Member Management (up to 50)", "Attendance Tracking", "Basic Reports"]'::jsonb),

('Basic', 'Ideal for small and medium gyms', 29, 290, 1, 200, 5, 
 '["Everything in Free", "Member Management (up to 200)", "Trainer Management (up to 5)", "Class Scheduling", "Payment Tracking", "Email Support"]'::jsonb),

('Pro', 'Best for growing gym businesses', 79, 790, 3, 1000, 20, 
 '["Everything in Basic", "Multi-Location (up to 3 gyms)", "Member Management (up to 1000)", "Email Notifications", "SMS Notifications", "Advanced Analytics", "Custom Reports", "Priority Support"]'::jsonb),

('Enterprise', 'For gym chains and franchises', 199, 1990, 999, 999999, 999, 
 '["Everything in Pro", "Unlimited Locations", "Unlimited Members", "Unlimited Trainers", "Custom Branding", "API Access", "Dedicated Account Manager", "24/7 Priority Support", "Custom Integrations"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- STEP 3: CREATE GYM_SUBSCRIPTIONS TABLE
-- ============================================
-- Links each gym to a subscription plan
CREATE TABLE IF NOT EXISTS gym_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES saas_plans(id),
    status VARCHAR(20) DEFAULT 'trialing', -- trialing, active, past_due, canceled, expired
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- monthly, yearly
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ, -- NULL for active subscriptions
    trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'), -- 14-day trial
    auto_renew BOOLEAN DEFAULT true,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gym_id) -- Each gym can only have one active subscription
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_gym_subscriptions_gym_id ON gym_subscriptions(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_subscriptions_status ON gym_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_gym_subscriptions_plan_id ON gym_subscriptions(plan_id);

-- ============================================
-- STEP 4: CREATE SUBSCRIPTION_PAYMENTS TABLE
-- ============================================
-- Track all payments made by gym owners
CREATE TABLE IF NOT EXISTS subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES gym_subscriptions(id) ON DELETE CASCADE,
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending', -- pending, succeeded, failed, refunded
    payment_method VARCHAR(50), -- stripe, razorpay, paypal, bank_transfer
    transaction_id VARCHAR(255), -- External payment gateway ID
    invoice_number VARCHAR(100),
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    billing_period_start TIMESTAMPTZ,
    billing_period_end TIMESTAMPTZ,
    metadata JSONB, -- Store additional payment details
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster payment lookups
CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription_id ON subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_gym_id ON subscription_payments(gym_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_status ON subscription_payments(status);

-- ============================================
-- STEP 5: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

-- RLS for saas_plans - Everyone can view available plans
ALTER TABLE saas_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active plans" ON saas_plans;
CREATE POLICY "Anyone can view active plans" ON saas_plans
FOR SELECT 
TO authenticated
USING (is_active = true);

-- RLS for gym_subscriptions - Gym owners can only see their own subscription
ALTER TABLE gym_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gym owners can view own subscription" ON gym_subscriptions;
CREATE POLICY "Gym owners can view own subscription" ON gym_subscriptions
FOR SELECT 
TO authenticated
USING (
    gym_id IN (
        SELECT id FROM gyms WHERE owner_user_id = auth.uid()
    )
);

-- Allow gym owners to update their own subscription (for cancellation, etc.)
DROP POLICY IF EXISTS "Gym owners can update own subscription" ON gym_subscriptions;
CREATE POLICY "Gym owners can update own subscription" ON gym_subscriptions
FOR UPDATE 
TO authenticated
USING (
    gym_id IN (
        SELECT id FROM gyms WHERE owner_user_id = auth.uid()
    )
)
WITH CHECK (
    gym_id IN (
        SELECT id FROM gyms WHERE owner_user_id = auth.uid()
    )
);

-- RLS for subscription_payments - Gym owners can only see their own payment history
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gym owners can view own payments" ON subscription_payments;
CREATE POLICY "Gym owners can view own payments" ON subscription_payments
FOR SELECT 
TO authenticated
USING (
    gym_id IN (
        SELECT id FROM gyms WHERE owner_user_id = auth.uid()
    )
);

-- ============================================
-- STEP 6: CREATE TRIGGERS FOR AUTO-UPDATES
-- ============================================

-- Trigger to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_saas_plans_updated_at ON saas_plans;
CREATE TRIGGER update_saas_plans_updated_at
    BEFORE UPDATE ON saas_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gym_subscriptions_updated_at ON gym_subscriptions;
CREATE TRIGGER update_gym_subscriptions_updated_at
    BEFORE UPDATE ON gym_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 7: CREATE DEFAULT FREE SUBSCRIPTIONS
-- ============================================
-- Automatically give all existing gyms a Free plan subscription

INSERT INTO gym_subscriptions (gym_id, plan_id, status, billing_cycle)
SELECT 
    g.id,
    (SELECT id FROM saas_plans WHERE name = 'Free' LIMIT 1),
    'active',
    'monthly'
FROM gyms g
WHERE NOT EXISTS (
    SELECT 1 FROM gym_subscriptions WHERE gym_id = g.id
);

-- ============================================
-- STEP 8: VERIFICATION QUERIES
-- ============================================

-- Verify plans were created
SELECT 
    name, 
    price_monthly, 
    max_members_per_gym, 
    max_trainers_per_gym 
FROM saas_plans 
ORDER BY price_monthly;

-- Verify subscriptions were created for existing gyms
SELECT 
    g.name AS gym_name,
    sp.name AS plan_name,
    gs.status,
    gs.trial_ends_at
FROM gym_subscriptions gs
JOIN gyms g ON gs.gym_id = g.id
JOIN saas_plans sp ON gs.plan_id = sp.id;

-- Count tables
SELECT 
    'saas_plans' AS table_name, COUNT(*) AS row_count FROM saas_plans
UNION ALL
SELECT 'gym_subscriptions', COUNT(*) FROM gym_subscriptions
UNION ALL
SELECT 'subscription_payments', COUNT(*) FROM subscription_payments;
