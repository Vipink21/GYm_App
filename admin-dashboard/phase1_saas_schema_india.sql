-- ================================================
-- PHASE 1: SaaS SUBSCRIPTION SCHEMA (INDIAN MARKET)
-- Complete Database Setup for Multi-Tenant SaaS Model
-- Currency: INR (Indian Rupees)
-- Payment Methods: Razorpay, UPI, PhonePe, Paytm
-- ================================================

-- ============================================
-- STEP 1: CREATE SAAS_PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS saas_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2),
    max_gyms INTEGER DEFAULT 1,
    max_members_per_gym INTEGER,
    max_trainers_per_gym INTEGER,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 2: INSERT INDIAN MARKET PLANS
-- ============================================
INSERT INTO saas_plans (name, description, price_monthly, price_yearly, max_gyms, max_members_per_gym, max_trainers_per_gym, features) VALUES
('Free', 'छोटे जिम के लिए बिल्कुल मुफ्त', 0, 0, 1, 50, 2, 
 '["Basic Dashboard", "Member Management (up to 50)", "Attendance Tracking", "Basic Reports", "WhatsApp Support"]'::jsonb),

('Basic', 'छोटे और मध्यम जिम के लिए आदर्श', 999, 9990, 1, 200, 5, 
 '["Everything in Free", "Member Management (up to 200)", "Trainer Management (up to 5)", "Class Scheduling", "Payment Tracking", "SMS Notifications", "Email Support"]'::jsonb),

('Pro', 'बढ़ते हुए जिम व्यवसाय के लिए श्रेष्ठ', 2499, 24990, 3, 1000, 20, 
 '["Everything in Basic", "Multi-Location (up to 3 gyms)", "Member Management (up to 1000)", "WhatsApp Notifications", "SMS & Email Notifications", "Advanced Analytics", "Custom Reports", "UPI Payment Integration", "Priority Support"]'::jsonb),

('Enterprise', 'जिम चेन और फ्रेंचाइजी के लिए', 6999, 69990, 999, 999999, 999, 
 '["Everything in Pro", "Unlimited Locations", "Unlimited Members", "Unlimited Trainers", "Custom Branding", "API Access", "Dedicated Account Manager", "24/7 Priority Support", "Custom Integrations", "Razorpay/PhonePe Integration"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- STEP 3: CREATE GYM_SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS gym_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES saas_plans(id),
    status VARCHAR(20) DEFAULT 'trialing',
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
    auto_renew BOOLEAN DEFAULT true,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gym_id)
);

CREATE INDEX IF NOT EXISTS idx_gym_subscriptions_gym_id ON gym_subscriptions(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_subscriptions_status ON gym_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_gym_subscriptions_plan_id ON gym_subscriptions(plan_id);

-- ============================================
-- STEP 4: CREATE SUBSCRIPTION_PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES gym_subscriptions(id) ON DELETE CASCADE,
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50), -- razorpay, upi, phonepe, paytm, bank_transfer, cash
    transaction_id VARCHAR(255),
    invoice_number VARCHAR(100),
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    billing_period_start TIMESTAMPTZ,
    billing_period_end TIMESTAMPTZ,
    gst_amount DECIMAL(10, 2), -- 18% GST
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription_id ON subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_gym_id ON subscription_payments(gym_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_status ON subscription_payments(status);

-- ============================================
-- STEP 5: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE saas_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active plans" ON saas_plans;
CREATE POLICY "Anyone can view active plans" ON saas_plans
FOR SELECT TO authenticated USING (is_active = true);

ALTER TABLE gym_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Gym owners can view own subscription" ON gym_subscriptions;
CREATE POLICY "Gym owners can view own subscription" ON gym_subscriptions
FOR SELECT TO authenticated
USING (gym_id IN (SELECT id FROM gyms WHERE owner_user_id = auth.uid()));

DROP POLICY IF EXISTS "Gym owners can update own subscription" ON gym_subscriptions;
CREATE POLICY "Gym owners can update own subscription" ON gym_subscriptions
FOR UPDATE TO authenticated
USING (gym_id IN (SELECT id FROM gyms WHERE owner_user_id = auth.uid()))
WITH CHECK (gym_id IN (SELECT id FROM gyms WHERE owner_user_id = auth.uid()));

ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Gym owners can view own payments" ON subscription_payments;
CREATE POLICY "Gym owners can view own payments" ON subscription_payments
FOR SELECT TO authenticated
USING (gym_id IN (SELECT id FROM gyms WHERE owner_user_id = auth.uid()));

-- ============================================
-- STEP 6: CREATE TRIGGERS FOR AUTO-UPDATES
-- ============================================

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

SELECT 
    name AS "Plan Name", 
    CONCAT('₹', price_monthly) AS "Monthly Price",
    CONCAT('₹', price_yearly) AS "Yearly Price",
    max_members_per_gym AS "Max Members", 
    max_trainers_per_gym AS "Max Trainers"
FROM saas_plans 
ORDER BY price_monthly;

SELECT 
    g.name AS "Gym Name",
    sp.name AS "Plan",
    gs.status AS "Status",
    TO_CHAR(gs.trial_ends_at, 'DD-MM-YYYY') AS "Trial Ends"
FROM gym_subscriptions gs
JOIN gyms g ON gs.gym_id = g.id
JOIN saas_plans sp ON gs.plan_id = sp.id;

SELECT 
    'saas_plans' AS "Table", COUNT(*) AS "Rows" FROM saas_plans
UNION ALL
SELECT 'gym_subscriptions', COUNT(*) FROM gym_subscriptions
UNION ALL
SELECT 'subscription_payments', COUNT(*) FROM subscription_payments;
