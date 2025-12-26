-- ============================================================
-- MASTER SCRIPT: Populate All Dashboard Pages with Dynamic Data
-- FIXED VERSION - Handles tables without unique constraints
-- ============================================================

DO $$
DECLARE
    v_gym_id UUID;
    v_member_ids UUID[];
    v_trainer_ids UUID[];
    v_class_ids UUID[];
    v_member_id UUID;
    v_class_id UUID;
    v_trainer_id UUID;
    i INTEGER;
BEGIN
    -- Get the first gym
    SELECT id INTO v_gym_id FROM public.gyms LIMIT 1;
    
    IF v_gym_id IS NULL THEN
        RAISE EXCEPTION 'No gym found. Please create a gym first.';
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Starting data population for gym_id: %', v_gym_id;
    RAISE NOTICE '========================================';
    
    -- ============================================================
    -- 1. ADD MEMBERS (only if they don't exist)
    -- ============================================================
    RAISE NOTICE '1. Adding Members...';
    
    -- Check and insert members one by one
    IF NOT EXISTS (SELECT 1 FROM public.members WHERE email = 'john.doe@example.com') THEN
        INSERT INTO public.members (gym_id, email, phone, full_name, first_name, last_name, status, member_plan, trainer_name, join_date)
        VALUES (v_gym_id, 'john.doe@example.com', '+91 98765 43210', 'John Doe', 'John', 'Doe', 'active', '6 Months Plan', 'Sarah M.', CURRENT_DATE - INTERVAL '30 days');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.members WHERE email = 'jane.smith@example.com') THEN
        INSERT INTO public.members (gym_id, email, phone, full_name, first_name, last_name, status, member_plan, trainer_name, join_date)
        VALUES (v_gym_id, 'jane.smith@example.com', '+91 98765 43211', 'Jane Smith', 'Jane', 'Smith', 'active', '3 Months Plan', 'Mike T.', CURRENT_DATE - INTERVAL '15 days');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.members WHERE email = 'bob.johnson@example.com') THEN
        INSERT INTO public.members (gym_id, email, phone, full_name, first_name, last_name, status, member_plan, trainer_name, join_date)
        VALUES (v_gym_id, 'bob.johnson@example.com', '+91 98765 43212', 'Bob Johnson', 'Bob', 'Johnson', 'expiring', '1 Month Plan', 'John D.', CURRENT_DATE - INTERVAL '85 days');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.members WHERE email = 'alice.williams@example.com') THEN
        INSERT INTO public.members (gym_id, email, phone, full_name, first_name, last_name, status, member_plan, trainer_name, join_date)
        VALUES (v_gym_id, 'alice.williams@example.com', '+91 98765 43213', 'Alice Williams', 'Alice', 'Williams', 'active', '6 Months Plan', 'Sarah M.', CURRENT_DATE - INTERVAL '60 days');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.members WHERE email = 'charlie.brown@example.com') THEN
        INSERT INTO public.members (gym_id, email, phone, full_name, first_name, last_name, status, member_plan, trainer_name, join_date)
        VALUES (v_gym_id, 'charlie.brown@example.com', '+91 98765 43214', 'Charlie Brown', 'Charlie', 'Brown', 'expired', '3 Months Plan', 'Mike T.', CURRENT_DATE - INTERVAL '120 days');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.members WHERE email = 'diana.prince@example.com') THEN
        INSERT INTO public.members (gym_id, email, phone, full_name, first_name, last_name, status, member_plan, trainer_name, join_date)
        VALUES (v_gym_id, 'diana.prince@example.com', '+91 98765 43215', 'Diana Prince', 'Diana', 'Prince', 'active', '6 Months Plan', 'John D.', CURRENT_DATE - INTERVAL '10 days');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.members WHERE email = 'peter.parker@example.com') THEN
        INSERT INTO public.members (gym_id, email, phone, full_name, first_name, last_name, status, member_plan, trainer_name, join_date)
        VALUES (v_gym_id, 'peter.parker@example.com', '+91 98765 43216', 'Peter Parker', 'Peter', 'Parker', 'active', '3 Months Plan', 'Sarah M.', CURRENT_DATE - INTERVAL '45 days');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.members WHERE email = 'mary.jane@example.com') THEN
        INSERT INTO public.members (gym_id, email, phone, full_name, first_name, last_name, status, member_plan, trainer_name, join_date)
        VALUES (v_gym_id, 'mary.jane@example.com', '+91 98765 43217', 'Mary Jane', 'Mary', 'Jane', 'expiring', '1 Month Plan', 'Mike T.', CURRENT_DATE - INTERVAL '80 days');
    END IF;
    
    RAISE NOTICE '✓ Members added';
    
    -- ============================================================
    -- 2. ADD TRAINERS (only if they don't exist)
    -- ============================================================
    RAISE NOTICE '2. Adding Trainers...';
    
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'sarah.m@fitzone.com') THEN
        INSERT INTO public.users (gym_id, role, email, phone, display_name, status, trainer_details)
        VALUES (v_gym_id, 'trainer', 'sarah.m@fitzone.com', '+91 98765 11111', 'Sarah M.', 'active',
            jsonb_build_object('specializations', ARRAY['Weight Training', 'HIIT', 'Nutrition'], 'max_clients', 25, 'current_clients', 18, 'experience', 5, 'rating', 4.8));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'mike.t@fitzone.com') THEN
        INSERT INTO public.users (gym_id, role, email, phone, display_name, status, trainer_details)
        VALUES (v_gym_id, 'trainer', 'mike.t@fitzone.com', '+91 98765 22222', 'Mike T.', 'active',
            jsonb_build_object('specializations', ARRAY['CrossFit', 'Boxing', 'Cardio'], 'max_clients', 20, 'current_clients', 15, 'experience', 7, 'rating', 4.9));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'john.d@fitzone.com') THEN
        INSERT INTO public.users (gym_id, role, email, phone, display_name, status, trainer_details)
        VALUES (v_gym_id, 'trainer', 'john.d@fitzone.com', '+91 98765 33333', 'John D.', 'active',
            jsonb_build_object('specializations', ARRAY['Yoga', 'Pilates', 'Dance Fitness'], 'max_clients', 30, 'current_clients', 22, 'experience', 3, 'rating', 4.7));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'emma.w@fitzone.com') THEN
        INSERT INTO public.users (gym_id, role, email, phone, display_name, status, trainer_details)
        VALUES (v_gym_id, 'trainer', 'emma.w@fitzone.com', '+91 98765 44444', 'Emma W.', 'active',
            jsonb_build_object('specializations', ARRAY['Zumba', 'Cardio', 'Dance Fitness'], 'max_clients', 35, 'current_clients', 28, 'experience', 4, 'rating', 4.9));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'david.l@fitzone.com') THEN
        INSERT INTO public.users (gym_id, role, email, phone, display_name, status, trainer_details)
        VALUES (v_gym_id, 'trainer', 'david.l@fitzone.com', '+91 98765 55555', 'David L.', 'on_leave',
            jsonb_build_object('specializations', ARRAY['Weight Training', 'Nutrition'], 'max_clients', 20, 'current_clients', 12, 'experience', 6, 'rating', 4.6));
    END IF;
    
    RAISE NOTICE '✓ Trainers added';
    
    -- Get trainer IDs for classes
    SELECT ARRAY_AGG(id) INTO v_trainer_ids FROM public.users WHERE role = 'trainer' AND gym_id = v_gym_id LIMIT 3;
    
    -- ============================================================
    -- 3. ADD CLASSES
    -- ============================================================
    RAISE NOTICE '3. Adding Classes...';
    
    -- Create classes table if needed
    CREATE TABLE IF NOT EXISTS public.classes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
        trainer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        type VARCHAR(50),
        schedule_day VARCHAR(20),
        schedule_time TIME,
        duration_minutes INTEGER DEFAULT 60,
        max_participants INTEGER DEFAULT 20,
        current_participants INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Gym owners can manage classes" ON public.classes;
    CREATE POLICY "Gym owners can manage classes" ON public.classes FOR ALL USING (gym_id IN (SELECT id FROM public.gyms WHERE owner_id = auth.uid()));
    
    -- Delete existing sample classes to avoid duplicates
    DELETE FROM public.classes WHERE gym_id = v_gym_id AND name IN ('Morning HIIT', 'CrossFit Basics', 'Yoga Flow', 'Weight Training 101', 'Boxing Bootcamp', 'Pilates Core', 'Evening Cardio Blast', 'Weekend Warriors', 'Zumba Party', 'Sunday Stretch');
    
    IF v_trainer_ids IS NOT NULL AND array_length(v_trainer_ids, 1) >= 3 THEN
        INSERT INTO public.classes (gym_id, trainer_id, name, description, type, schedule_day, schedule_time, duration_minutes, max_participants, current_participants, status) VALUES
        (v_gym_id, v_trainer_ids[1], 'Morning HIIT', 'High-intensity interval training', 'HIIT', 'Monday', '06:00', 45, 20, 15, 'active'),
        (v_gym_id, v_trainer_ids[2], 'CrossFit Basics', 'Introduction to CrossFit', 'CrossFit', 'Monday', '18:00', 60, 15, 12, 'active'),
        (v_gym_id, v_trainer_ids[3], 'Yoga Flow', 'Relaxing yoga session', 'Yoga', 'Tuesday', '07:00', 60, 25, 20, 'active'),
        (v_gym_id, v_trainer_ids[1], 'Weight Training 101', 'Learn proper form', 'Weight Training', 'Tuesday', '17:00', 75, 12, 10, 'active'),
        (v_gym_id, v_trainer_ids[2], 'Boxing Bootcamp', 'High-energy boxing', 'Boxing', 'Wednesday', '18:30', 60, 18, 14, 'active'),
        (v_gym_id, v_trainer_ids[3], 'Pilates Core', 'Strengthen your core', 'Pilates', 'Thursday', '08:00', 50, 20, 16, 'active'),
        (v_gym_id, v_trainer_ids[1], 'Evening Cardio Blast', 'Intense cardio', 'Cardio', 'Thursday', '19:00', 45, 25, 22, 'active'),
        (v_gym_id, v_trainer_ids[2], 'Weekend Warriors', 'Full body workout', 'CrossFit', 'Saturday', '09:00', 90, 20, 18, 'active'),
        (v_gym_id, v_trainer_ids[3], 'Zumba Party', 'Dance fitness party', 'Zumba', 'Saturday', '11:00', 60, 30, 25, 'active'),
        (v_gym_id, v_trainer_ids[1], 'Sunday Stretch', 'Recovery session', 'Yoga', 'Sunday', '10:00', 60, 20, 12, 'active');
    END IF;
    
    RAISE NOTICE '✓ Classes added';
    
    -- Get IDs for attendance and payments
    SELECT ARRAY_AGG(id) INTO v_member_ids FROM public.members WHERE gym_id = v_gym_id;
    SELECT ARRAY_AGG(id) INTO v_class_ids FROM public.classes WHERE gym_id = v_gym_id;
    
    -- ============================================================
    -- 4. ADD ATTENDANCE
    -- ============================================================
    RAISE NOTICE '4. Adding Attendance records...';
    
    CREATE TABLE IF NOT EXISTS public.attendance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
        member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
        class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
        check_in_time TIMESTAMPTZ NOT NULL,
        check_out_time TIMESTAMPTZ,
        date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'present',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Gym owners can manage attendance" ON public.attendance;
    CREATE POLICY "Gym owners can manage attendance" ON public.attendance FOR ALL USING (gym_id IN (SELECT id FROM public.gyms WHERE owner_id = auth.uid()));
    
    -- Delete existing sample attendance
    DELETE FROM public.attendance WHERE gym_id = v_gym_id AND date >= CURRENT_DATE - 7;
    
    IF v_member_ids IS NOT NULL AND array_length(v_member_ids, 1) > 0 THEN
        FOR i IN 0..6 LOOP
            FOR j IN 1..4 LOOP
                v_member_id := v_member_ids[1 + (random() * (array_length(v_member_ids, 1) - 1))::int];
                v_class_id := CASE WHEN v_class_ids IS NOT NULL AND array_length(v_class_ids, 1) > 0 
                    THEN v_class_ids[1 + (random() * (array_length(v_class_ids, 1) - 1))::int] ELSE NULL END;
                
                INSERT INTO public.attendance (gym_id, member_id, class_id, check_in_time, check_out_time, date, status)
                VALUES (
                    v_gym_id, v_member_id, v_class_id,
                    (CURRENT_DATE - i) + TIME '06:00:00' + (random() * INTERVAL '12 hours'),
                    (CURRENT_DATE - i) + TIME '07:00:00' + (random() * INTERVAL '13 hours'),
                    CURRENT_DATE - i,
                    CASE WHEN random() < 0.9 THEN 'present' ELSE 'late' END
                );
            END LOOP;
        END LOOP;
    END IF;
    
    RAISE NOTICE '✓ Attendance records added';
    
    -- ============================================================
    -- 5. ADD PAYMENTS
    -- ============================================================
    RAISE NOTICE '5. Adding Payment records...';
    
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
    
    ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Gym owners can manage payments" ON public.payments;
    CREATE POLICY "Gym owners can manage payments" ON public.payments FOR ALL USING (gym_id IN (SELECT id FROM public.gyms WHERE owner_id = auth.uid()));
    
    -- Delete existing sample payments
    DELETE FROM public.payments WHERE gym_id = v_gym_id AND transaction_id LIKE 'TXN%';
    
    IF v_member_ids IS NOT NULL AND array_length(v_member_ids, 1) > 0 THEN
        FOR i IN 0..20 LOOP
            v_member_id := v_member_ids[1 + (random() * (array_length(v_member_ids, 1) - 1))::int];
            DECLARE
                plan_names TEXT[] := ARRAY['1 Month Plan', '3 Months Plan', '6 Months Plan'];
                plan_prices NUMERIC[] := ARRAY[1500, 4000, 7500];
                plan_idx INTEGER := 1 + (random() * 2)::int;
                payment_status VARCHAR(20) := CASE WHEN random() < 0.95 THEN 'completed' WHEN random() < 0.5 THEN 'pending' ELSE 'failed' END;
            BEGIN
                INSERT INTO public.payments (gym_id, member_id, amount, payment_type, payment_method, status, transaction_id, razorpay_payment_id, razorpay_order_id, plan_name, description, payment_date)
                VALUES (
                    v_gym_id, v_member_id, plan_prices[plan_idx], 'membership',
                    CASE WHEN random() < 0.7 THEN 'razorpay' WHEN random() < 0.5 THEN 'cash' ELSE 'upi' END,
                    payment_status,
                    'TXN' || LPAD((random() * 999999)::int::text, 6, '0'),
                    CASE WHEN payment_status = 'completed' THEN 'pay_' || substr(md5(random()::text), 1, 14) ELSE NULL END,
                    CASE WHEN payment_status = 'completed' THEN 'order_' || substr(md5(random()::text), 1, 14) ELSE NULL END,
                    plan_names[plan_idx],
                    'Membership fee for ' || plan_names[plan_idx],
                    NOW() - ((random() * 60)::int || ' days')::interval
                );
            END;
        END LOOP;
    END IF;
    
    RAISE NOTICE '✓ Payment records added';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATA POPULATION COMPLETE!';
    RAISE NOTICE '========================================';
END $$;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

SELECT '📊 SUMMARY' as info;

SELECT 
    'Members' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
FROM public.members
UNION ALL
SELECT 
    'Trainers',
    COUNT(*),
    COUNT(CASE WHEN status = 'active' THEN 1 END)
FROM public.users WHERE role = 'trainer'
UNION ALL
SELECT 
    'Classes',
    COUNT(*),
    COUNT(CASE WHEN status = 'active' THEN 1 END)
FROM public.classes
UNION ALL
SELECT 
    'Attendance',
    COUNT(*),
    COUNT(CASE WHEN status = 'present' THEN 1 END)
FROM public.attendance
UNION ALL
SELECT 
    'Payments',
    COUNT(*),
    COUNT(CASE WHEN status = 'completed' THEN 1 END)
FROM public.payments;

SELECT '✅ All data populated successfully! Refresh your dashboard pages to see the data.' as message;
