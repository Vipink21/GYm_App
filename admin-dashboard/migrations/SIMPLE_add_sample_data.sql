-- ============================================================
-- SIMPLE DATA POPULATION SCRIPT
-- No RLS policy creation - just adds data
-- ============================================================

DO $$
DECLARE
    v_gym_id UUID;
    v_member_ids UUID[];
    v_trainer_ids UUID[];
    v_class_ids UUID[];
    v_member_id UUID;
    v_class_id UUID;
    i INTEGER;
BEGIN
    -- Get the first gym
    SELECT id INTO v_gym_id FROM public.gyms LIMIT 1;
    
    IF v_gym_id IS NULL THEN
        RAISE EXCEPTION 'No gym found. Please create a gym first.';
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Populating data for gym_id: %', v_gym_id;
    RAISE NOTICE '========================================';
    
    -- ============================================================
    -- 1. ADD MEMBERS
    -- ============================================================
    RAISE NOTICE '1. Adding Members...';
    
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
    
    RAISE NOTICE '✓ Members added: 8';
    
    -- ============================================================
    -- 2. ADD TRAINERS
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
        VALUES (v_gym_id, 'trainer', 'david.l@fitzone.com', '+91 98765 55555', 'David L.', 'inactive',
            jsonb_build_object('specializations', ARRAY['Weight Training', 'Nutrition'], 'max_clients', 20, 'current_clients', 12, 'experience', 6, 'rating', 4.6));
    END IF;
    
    RAISE NOTICE '✓ Trainers added: 5';
    
    -- Get trainer IDs
    SELECT ARRAY_AGG(id) INTO v_trainer_ids FROM public.users WHERE role = 'trainer' AND gym_id = v_gym_id LIMIT 3;
    
    -- ============================================================
    -- 3. ADD CLASSES (skip if table doesn't exist)
    -- ============================================================
    RAISE NOTICE '3. Adding Classes...';
    
    BEGIN
        -- Try to create classes table
        CREATE TABLE IF NOT EXISTS public.classes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            gym_id UUID NOT NULL,
            trainer_id UUID,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            type VARCHAR(50),
            schedule_day VARCHAR(20),
            schedule_time TIME,
            duration_minutes INTEGER DEFAULT 60,
            max_participants INTEGER DEFAULT 20,
            current_participants INTEGER DEFAULT 0,
            status VARCHAR(20) DEFAULT 'active',
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Delete existing sample classes
        DELETE FROM public.classes WHERE gym_id = v_gym_id AND name LIKE '%HIIT%' OR name LIKE '%CrossFit%' OR name LIKE '%Yoga%';
        
        IF v_trainer_ids IS NOT NULL AND array_length(v_trainer_ids, 1) >= 3 THEN
            INSERT INTO public.classes (gym_id, trainer_id, name, description, type, schedule_day, schedule_time, duration_minutes, max_participants, current_participants) VALUES
            (v_gym_id, v_trainer_ids[1], 'Morning HIIT', 'High-intensity interval training', 'HIIT', 'Monday', '06:00', 45, 20, 15),
            (v_gym_id, v_trainer_ids[2], 'CrossFit Basics', 'Introduction to CrossFit', 'CrossFit', 'Monday', '18:00', 60, 15, 12),
            (v_gym_id, v_trainer_ids[3], 'Yoga Flow', 'Relaxing yoga session', 'Yoga', 'Tuesday', '07:00', 60, 25, 20),
            (v_gym_id, v_trainer_ids[1], 'Weight Training 101', 'Learn proper form', 'Weight Training', 'Tuesday', '17:00', 75, 12, 10),
            (v_gym_id, v_trainer_ids[2], 'Boxing Bootcamp', 'High-energy boxing', 'Boxing', 'Wednesday', '18:30', 60, 18, 14),
            (v_gym_id, v_trainer_ids[3], 'Pilates Core', 'Strengthen your core', 'Pilates', 'Thursday', '08:00', 50, 20, 16),
            (v_gym_id, v_trainer_ids[1], 'Evening Cardio', 'Intense cardio', 'Cardio', 'Thursday', '19:00', 45, 25, 22),
            (v_gym_id, v_trainer_ids[2], 'Weekend Warriors', 'Full body workout', 'CrossFit', 'Saturday', '09:00', 90, 20, 18),
            (v_gym_id, v_trainer_ids[3], 'Zumba Party', 'Dance fitness', 'Zumba', 'Saturday', '11:00', 60, 30, 25),
            (v_gym_id, v_trainer_ids[1], 'Sunday Stretch', 'Recovery session', 'Yoga', 'Sunday', '10:00', 60, 20, 12);
            
            RAISE NOTICE '✓ Classes added: 10';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '⚠ Classes table creation skipped (may already exist with different schema)';
    END;
    
    -- Get IDs
    SELECT ARRAY_AGG(id) INTO v_member_ids FROM public.members WHERE gym_id = v_gym_id;
    BEGIN
        SELECT ARRAY_AGG(id) INTO v_class_ids FROM public.classes WHERE gym_id = v_gym_id;
    EXCEPTION
        WHEN OTHERS THEN
            v_class_ids := NULL;
    END;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATA POPULATION COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '- Members: Check your Members page';
    RAISE NOTICE '- Trainers: Check your Trainers page';
    RAISE NOTICE '- Classes: Check your Classes page';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Refresh your dashboard to see the data!';
END $$;

-- Verification
SELECT 'Members' as table_name, COUNT(*) as records FROM public.members
UNION ALL
SELECT 'Trainers', COUNT(*) FROM public.users WHERE role = 'trainer';
