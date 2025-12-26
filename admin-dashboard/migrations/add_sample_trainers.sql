-- Add sample trainers data for testing
-- This will help populate the Trainers page with dynamic data

-- First, get a gym_id to use
DO $$
DECLARE
    v_gym_id UUID;
BEGIN
    -- Get the first gym from the gyms table
    SELECT id INTO v_gym_id FROM public.gyms LIMIT 1;
    
    IF v_gym_id IS NULL THEN
        RAISE EXCEPTION 'No gym found. Please create a gym first.';
    END IF;
    
    -- Insert sample trainers
    INSERT INTO public.users (
        gym_id,
        role,
        email,
        phone,
        display_name,
        status,
        trainer_details
    ) VALUES
    (
        v_gym_id, 
        'trainer', 
        'sarah.m@fitzone.com', 
        '+91 98765 11111', 
        'Sarah M.', 
        'active',
        jsonb_build_object(
            'specializations', ARRAY['Weight Training', 'HIIT', 'Nutrition'],
            'max_clients', 25,
            'current_clients', 18,
            'experience', 5,
            'rating', 4.8
        )
    ),
    (
        v_gym_id, 
        'trainer', 
        'mike.t@fitzone.com', 
        '+91 98765 22222', 
        'Mike T.', 
        'active',
        jsonb_build_object(
            'specializations', ARRAY['CrossFit', 'Boxing', 'Cardio'],
            'max_clients', 20,
            'current_clients', 15,
            'experience', 7,
            'rating', 4.9
        )
    ),
    (
        v_gym_id, 
        'trainer', 
        'john.d@fitzone.com', 
        '+91 98765 33333', 
        'John D.', 
        'active',
        jsonb_build_object(
            'specializations', ARRAY['Yoga', 'Pilates', 'Dance Fitness'],
            'max_clients', 30,
            'current_clients', 22,
            'experience', 3,
            'rating', 4.7
        )
    ),
    (
        v_gym_id, 
        'trainer', 
        'emma.w@fitzone.com', 
        '+91 98765 44444', 
        'Emma W.', 
        'active',
        jsonb_build_object(
            'specializations', ARRAY['Zumba', 'Cardio', 'Dance Fitness'],
            'max_clients', 35,
            'current_clients', 28,
            'experience', 4,
            'rating', 4.9
        )
    ),
    (
        v_gym_id, 
        'trainer', 
        'david.l@fitzone.com', 
        '+91 98765 55555', 
        'David L.', 
        'on_leave',
        jsonb_build_object(
            'specializations', ARRAY['Weight Training', 'Nutrition'],
            'max_clients', 20,
            'current_clients', 12,
            'experience', 6,
            'rating', 4.6
        )
    )
    ON CONFLICT (email) DO NOTHING;
    
    RAISE NOTICE 'Sample trainers added successfully for gym_id: %', v_gym_id;
END $$;

-- Verify the data was inserted
SELECT 
    COUNT(*) as total_trainers,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_trainers,
    COUNT(CASE WHEN status = 'on_leave' THEN 1 END) as on_leave_trainers
FROM public.users
WHERE role = 'trainer';

-- Show the inserted trainers
SELECT 
    display_name,
    email,
    phone,
    status,
    trainer_details->>'specializations' as specializations,
    (trainer_details->>'current_clients')::int as current_clients,
    (trainer_details->>'max_clients')::int as max_clients,
    (trainer_details->>'experience')::int as experience_years,
    (trainer_details->>'rating')::numeric as rating
FROM public.users
WHERE role = 'trainer'
ORDER BY created_at DESC
LIMIT 10;
