-- Add sample attendance data for testing
-- This will help populate the Attendance page with dynamic data

DO $$
DECLARE
    v_gym_id UUID;
    v_member_ids UUID[];
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
    
    -- Get member IDs
    SELECT ARRAY_AGG(id) INTO v_member_ids 
    FROM public.members 
    WHERE gym_id = v_gym_id 
    LIMIT 10;
    
    -- Get class IDs
    SELECT ARRAY_AGG(id) INTO v_class_ids 
    FROM public.classes 
    WHERE gym_id = v_gym_id 
    LIMIT 10;
    
    -- Create attendance table if it doesn't exist
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
    
    -- Enable RLS
    ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    DROP POLICY IF EXISTS "Gym owners can manage attendance" ON public.attendance;
    CREATE POLICY "Gym owners can manage attendance"
        ON public.attendance
        FOR ALL
        USING (
            gym_id IN (
                SELECT id FROM public.gyms WHERE owner_id = auth.uid()
            )
        );
    
    -- Insert sample attendance records for the last 7 days
    IF v_member_ids IS NOT NULL AND array_length(v_member_ids, 1) > 0 THEN
        FOR i IN 0..6 LOOP
            -- Add 3-5 random attendance records per day
            FOR j IN 1..4 LOOP
                v_member_id := v_member_ids[1 + (random() * (array_length(v_member_ids, 1) - 1))::int];
                v_class_id := CASE 
                    WHEN v_class_ids IS NOT NULL AND array_length(v_class_ids, 1) > 0 
                    THEN v_class_ids[1 + (random() * (array_length(v_class_ids, 1) - 1))::int]
                    ELSE NULL 
                END;
                
                INSERT INTO public.attendance (
                    gym_id,
                    member_id,
                    class_id,
                    check_in_time,
                    check_out_time,
                    date,
                    status
                ) VALUES (
                    v_gym_id,
                    v_member_id,
                    v_class_id,
                    (CURRENT_DATE - i) + TIME '06:00:00' + (random() * INTERVAL '12 hours'),
                    (CURRENT_DATE - i) + TIME '07:00:00' + (random() * INTERVAL '13 hours'),
                    CURRENT_DATE - i,
                    CASE 
                        WHEN random() < 0.9 THEN 'present'
                        ELSE 'late'
                    END
                )
                ON CONFLICT DO NOTHING;
            END LOOP;
        END LOOP;
    END IF;
    
    RAISE NOTICE 'Sample attendance records added successfully for gym_id: %', v_gym_id;
END $$;

-- Verify the data
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
    COUNT(CASE WHEN status = 'late' THEN 1 END) as late,
    COUNT(DISTINCT member_id) as unique_members,
    COUNT(DISTINCT date) as days_tracked
FROM public.attendance;

-- Show recent attendance
SELECT 
    a.date,
    m.full_name as member,
    c.name as class,
    TO_CHAR(a.check_in_time, 'HH24:MI') as check_in,
    TO_CHAR(a.check_out_time, 'HH24:MI') as check_out,
    a.status
FROM public.attendance a
LEFT JOIN public.members m ON a.member_id = m.id
LEFT JOIN public.classes c ON a.class_id = c.id
ORDER BY a.date DESC, a.check_in_time DESC
LIMIT 20;
