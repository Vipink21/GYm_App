# 🚀 Complete SaaS Transformation Plan
## Gym Management System - Full Implementation Roadmap

---

## **PHASE 1: Database Schema & Subscription Foundation (Days 1-2)**

### Step 1.1: Create SaaS Plans Table
**File:** `create_saas_schema.sql`

```sql
-- SaaS Subscription Plans Table
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans
INSERT INTO saas_plans (name, description, price_monthly, price_yearly, max_gyms, max_members_per_gym, max_trainers_per_gym, features) VALUES
('Free', 'Perfect for getting started', 0, 0, 1, 50, 2, '["Basic Dashboard", "Member Management", "Attendance Tracking"]'),
('Basic', 'For small gyms', 29, 290, 1, 200, 5, '["Everything in Free", "Trainer Management", "Class Scheduling", "Payment Tracking"]'),
('Pro', 'For growing gyms', 79, 790, 3, 1000, 20, '["Everything in Basic", "Email Notifications", "Advanced Reports", "Priority Support"]'),
('Enterprise', 'For gym chains', 199, 1990, 999, 999999, 999, '["Everything in Pro", "Custom Branding", "API Access", "Dedicated Support"]');
```

### Step 1.2: Create Gym Subscriptions Table

```sql
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gym_id)
);
```

### Step 1.3: Add RLS Policies

```sql
ALTER TABLE saas_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view plans" ON saas_plans FOR SELECT USING (true);

ALTER TABLE gym_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gym owners view own subscription" ON gym_subscriptions
FOR SELECT USING (
    gym_id IN (SELECT id FROM gyms WHERE owner_user_id = auth.uid())
);
```

---

## **PHASE 2: Subscription Service (Day 3)**

Create `src/services/subscriptionService.ts` with:
- getPlans()
- getCurrentSubscription()
- getUsageStats()
- canAddMember()

---

## **PHASE 3: UI Components (Days 4-5)**

1. SubscriptionBadge component
2. UsageMeter component
3. PlansPage with pricing cards
4. Upgrade flow

---

## **PHASE 4: Integration (Day 6)**

- Add subscription info to Dashboard
- Add usage limits to Members page
- Show plan in Settings

---

## **PHASE 5: Super Admin (Days 7-8)**

- SuperAdminPage to view all gyms
- Revenue analytics
- Customer management

---

## **PHASE 6: Payments (Days 9-10)**

- Stripe/Razorpay integration
- Checkout flow
- Webhook handling

---

## **PHASE 7: Notifications (Days 11-12)**

- Trial ending emails
- Payment reminders
- Subscription renewal

---

## **Timeline: 12-14 Days**

Ready to start Phase 1?
