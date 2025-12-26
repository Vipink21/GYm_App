-- Add sample payments data for testing
-- This will help populate the Payments page with dynamic data

DO $$
DECLARE
    v_gym_id UUID;
    v_member_ids UUID[];
    v_member_id UUID;
    v_plan_names TEXT[] := ARRAY['1 Month Plan', '3 Months Plan', '6 Months Plan'];
    v_plan_prices NUMERIC[] := ARRAY[1500, 4000, 7500];
    i INTEGER;
BEGIN
    -- Get the first gym
    SELECT id INTO v_gym_id FROM public.gyms LIMIT 1;
    
    IF v_gym_id IS NULL THEN
        RAISE EXCEPTION 'No gym found. Please create a gym first.';
    END IF;
    
    -- Get member IDs
    SELECT ARRAY_AGG(id) INTO v_member_ids 
    FROM public.members 
    WHERE gym_id = v_gym_id;
    
    -- Create payments table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
        member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_type VARCHAR(50) NOT NULL,
        payment_method VARCHAR(50),
        status VARCHAR(20) DEFAULT 'completed',
        transaction_id VARCHAR(100),
        razorpay_payment_id VARCHAR(100),
        razorpay_order_id VARCHAR(100),
        plan_name VARCHAR(100),
        description TEXT,
        payment_date TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Enable RLS
    ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    DROP POLICY IF EXISTS "Gym owners can manage payments" ON public.payments;
    CREATE POLICY "Gym owners can manage payments"
        ON public.payments
        FOR ALL
        USING (
            gym_id IN (
                SELECT id FROM public.gyms WHERE owner_id = auth.uid()
            )
        );
    
    -- Insert sample payment records for the last 60 days
    IF v_member_ids IS NOT NULL AND array_length(v_member_ids, 1) > 0 THEN
        FOR i IN 0..20 LOOP
            v_member_id := v_member_ids[1 + (random() * (array_length(v_member_ids, 1) - 1))::int];
            
            DECLARE
                plan_idx INTEGER := 1 + (random() * 2)::int;
                payment_status VARCHAR(20);
                days_ago INTEGER := (random() * 60)::int;
            BEGIN
                -- 95% completed, 5% pending/failed
                IF random() < 0.95 THEN
                    payment_status := 'completed';
                ELSIF random() < 0.5 THEN
                    payment_status := 'pending';
                ELSE
                    payment_status := 'failed';
                END IF;
                
                INSERT INTO public.payments (
                    gym_id,
                    member_id,
                    amount,
                    payment_type,
                    payment_method,
                    status,
                    transaction_id,
                    razorpay_payment_id,
                    razorpay_order_id,
                    plan_name,
                    description,
                    payment_date
                ) VALUES (
                    v_gym_id,
                    v_member_id,
                    v_plan_prices[plan_idx],
                    'membership',
                    CASE 
                        WHEN random() < 0.7 THEN 'razorpay'
                        WHEN random() < 0.5 THEN 'cash'
                        ELSE 'upi'
                    END,
                    payment_status,
                    'TXN' || LPAD((random() * 999999)::int::text, 6, '0'),
                    CASE WHEN payment_status = 'completed' THEN 'pay_' || substr(md5(random()::text), 1, 14) ELSE NULL END,
                    CASE WHEN payment_status = 'completed' THEN 'order_' || substr(md5(random()::text), 1, 14) ELSE NULL END,
                    v_plan_names[plan_idx],
                    'Membership fee for ' || v_plan_names[plan_idx],
                    NOW() - (days_ago || ' days')::interval
                );
            END;
        END LOOP;
    END IF;
    
    RAISE NOTICE 'Sample payment records added successfully for gym_id: %', v_gym_id;
END $$;

-- Verify the data
SELECT 
    COUNT(*) as total_payments,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue
FROM public.payments;

-- Show recent payments
SELECT 
    p.payment_date::date as date,
    m.full_name as member,
    p.plan_name,
    p.amount,
    p.payment_method,
    p.status,
    p.transaction_id
FROM public.payments p
LEFT JOIN public.members m ON p.member_id = m.id
ORDER BY p.payment_date DESC
LIMIT 20;
