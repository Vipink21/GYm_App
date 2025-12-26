-- Add sample classes data for testing
-- This will help populate the Classes page with dynamic data

DO $$
DECLARE
    v_gym_id UUID;
    v_trainer1_id UUID;
    v_trainer2_id UUID;
    v_trainer3_id UUID;
BEGIN
    -- Get the first gym
    SELECT id INTO v_gym_id FROM public.gyms LIMIT 1;
    
    IF v_gym_id IS NULL THEN
        RAISE EXCEPTION 'No gym found. Please create a gym first.';
    END IF;
    
    -- Get some trainer IDs
    SELECT id INTO v_trainer1_id FROM public.users WHERE role = 'trainer' AND gym_id = v_gym_id LIMIT 1 OFFSET 0;
    SELECT id INTO v_trainer2_id FROM public.users WHERE role = 'trainer' AND gym_id = v_gym_id LIMIT 1 OFFSET 1;
    SELECT id INTO v_trainer3_id FROM public.users WHERE role = 'trainer' AND gym_id = v_gym_id LIMIT 1 OFFSET 2;
    
    -- Create classes table if it doesn't exist
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
    
    -- Enable RLS
    ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
    
    -- Create policies if they don't exist
    DROP POLICY IF EXISTS "Gym owners can manage classes" ON public.classes;
    CREATE POLICY "Gym owners can manage classes"
        ON public.classes
        FOR ALL
        USING (
            gym_id IN (
                SELECT id FROM public.gyms WHERE owner_id = auth.uid()
            )
        );
    
    -- Insert sample classes
    INSERT INTO public.classes (
        gym_id,
        trainer_id,
        name,
        description,
        type,
        schedule_day,
        schedule_time,
        duration_minutes,
        max_participants,
        current_participants,
        status
    ) VALUES
    (v_gym_id, v_trainer1_id, 'Morning HIIT', 'High-intensity interval training to kickstart your day', 'HIIT', 'Monday', '06:00', 45, 20, 15, 'active'),
    (v_gym_id, v_trainer2_id, 'CrossFit Basics', 'Introduction to CrossFit movements and techniques', 'CrossFit', 'Monday', '18:00', 60, 15, 12, 'active'),
    (v_gym_id, v_trainer3_id, 'Yoga Flow', 'Relaxing yoga session for flexibility and mindfulness', 'Yoga', 'Tuesday', '07:00', 60, 25, 20, 'active'),
    (v_gym_id, v_trainer1_id, 'Weight Training 101', 'Learn proper form and technique for weight training', 'Weight Training', 'Tuesday', '17:00', 75, 12, 10, 'active'),
    (v_gym_id, v_trainer2_id, 'Boxing Bootcamp', 'High-energy boxing workout', 'Boxing', 'Wednesday', '18:30', 60, 18, 14, 'active'),
    (v_gym_id, v_trainer3_id, 'Pilates Core', 'Strengthen your core with Pilates', 'Pilates', 'Thursday', '08:00', 50, 20, 16, 'active'),
    (v_gym_id, v_trainer1_id, 'Evening Cardio Blast', 'Intense cardio session', 'Cardio', 'Thursday', '19:00', 45, 25, 22, 'active'),
    (v_gym_id, v_trainer2_id, 'Weekend Warriors', 'Full body workout for the weekend', 'CrossFit', 'Saturday', '09:00', 90, 20, 18, 'active'),
    (v_gym_id, v_trainer3_id, 'Zumba Party', 'Dance fitness party', 'Zumba', 'Saturday', '11:00', 60, 30, 25, 'active'),
    (v_gym_id, v_trainer1_id, 'Sunday Stretch', 'Recovery and stretching session', 'Yoga', 'Sunday', '10:00', 60, 20, 12, 'active')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Sample classes added successfully for gym_id: %', v_gym_id;
END $$;

-- Verify the data
SELECT 
    COUNT(*) as total_classes,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_classes
FROM public.classes;

-- Show the classes
SELECT 
    c.name,
    u.display_name as trainer,
    c.type,
    c.schedule_day,
    c.schedule_time,
    c.duration_minutes,
    c.current_participants || '/' || c.max_participants as capacity,
    c.status
FROM public.classes c
LEFT JOIN public.users u ON c.trainer_id = u.id
ORDER BY 
    CASE c.schedule_day
        WHEN 'Monday' THEN 1
        WHEN 'Tuesday' THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4
        WHEN 'Friday' THEN 5
        WHEN 'Saturday' THEN 6
        WHEN 'Sunday' THEN 7
    END,
    c.schedule_time;
