-- ENHANCE SUBSCRIPTION TABLE
-- Stores a snapshot of the plan details at the time of signup

ALTER TABLE public.gym_subscriptions
ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS plan_details JSONB; 
-- plan_details will store: { "name": "Pro", "max_members": 100, "limits": {...} }

-- Optional: Rename table if you strictly want "owner_subscriptions", 
-- but keeping 'gym_subscriptions' is safer for existing code.
-- ALTER TABLE public.gym_subscriptions RENAME TO owner_subscriptions;
