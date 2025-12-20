-- ============================================================
-- REVENUE & TRANSACTION TRACKING
-- Stores all payments made by Gym Owners
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subscription_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.saas_plans(id),
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
    payment_method TEXT, -- razorpay, stripe, manual
    razorpay_payment_id TEXT,
    razorpay_order_id TEXT,
    billing_cycle TEXT NOT NULL, -- monthly, yearly
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- POLICIES
-- 1. Super Admin sees all payments
CREATE POLICY "Super Admin View All Payments" 
ON public.subscription_payments FOR SELECT 
USING (public.is_super_admin_v5());

-- 2. Gym Owners see their own payments
CREATE POLICY "Gym Owners View Own Payments" 
ON public.subscription_payments FOR SELECT 
USING (gym_id IN (SELECT id FROM public.gyms WHERE owner_user_id = auth.uid()));

-- Add Revenue Function for Dashboard
CREATE OR REPLACE FUNCTION public.get_total_revenue()
RETURNS DECIMAL AS $$
BEGIN
  RETURN (SELECT COALESCE(SUM(amount), 0) FROM public.subscription_payments WHERE status = 'completed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verification
SELECT 'Revenue table and security created!' as status;
