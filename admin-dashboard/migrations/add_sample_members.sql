-- Add sample members data for testing
-- This will help populate the Members page with dynamic data

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
    
    -- Insert sample members
    INSERT INTO public.members (
        gym_id,
        email,
        phone,
        full_name,
        first_name,
        last_name,
        status,
        member_plan,
        trainer_name,
        join_date
    ) VALUES
    (v_gym_id, 'john.doe@example.com', '+91 98765 43210', 'John Doe', 'John', 'Doe', 'active', 'Gold Annual', 'Sarah M.', CURRENT_DATE - INTERVAL '30 days'),
    (v_gym_id, 'jane.smith@example.com', '+91 98765 43211', 'Jane Smith', 'Jane', 'Smith', 'active', 'Silver Monthly', 'Mike T.', CURRENT_DATE - INTERVAL '15 days'),
    (v_gym_id, 'bob.johnson@example.com', '+91 98765 43212', 'Bob Johnson', 'Bob', 'Johnson', 'expiring', 'Bronze', 'John D.', CURRENT_DATE - INTERVAL '85 days'),
    (v_gym_id, 'alice.williams@example.com', '+91 98765 43213', 'Alice Williams', 'Alice', 'Williams', 'active', 'Platinum', 'Sarah M.', CURRENT_DATE - INTERVAL '60 days'),
    (v_gym_id, 'charlie.brown@example.com', '+91 98765 43214', 'Charlie Brown', 'Charlie', 'Brown', 'expired', 'Silver Monthly', 'Mike T.', CURRENT_DATE - INTERVAL '120 days'),
    (v_gym_id, 'diana.prince@example.com', '+91 98765 43215', 'Diana Prince', 'Diana', 'Prince', 'active', 'Gold Annual', 'John D.', CURRENT_DATE - INTERVAL '10 days'),
    (v_gym_id, 'peter.parker@example.com', '+91 98765 43216', 'Peter Parker', 'Peter', 'Parker', 'active', 'Platinum', 'Sarah M.', CURRENT_DATE - INTERVAL '45 days'),
    (v_gym_id, 'mary.jane@example.com', '+91 98765 43217', 'Mary Jane', 'Mary', 'Jane', 'expiring', 'Bronze', 'Mike T.', CURRENT_DATE - INTERVAL '80 days')
    ON CONFLICT (email) DO NOTHING;
    
    RAISE NOTICE 'Sample members added successfully for gym_id: %', v_gym_id;
END $$;

-- Verify the data was inserted
SELECT 
    COUNT(*) as total_members,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_members,
    COUNT(CASE WHEN status = 'expiring' THEN 1 END) as expiring_members,
    COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_members
FROM public.members;

-- Show the inserted members
SELECT 
    full_name,
    email,
    phone,
    member_plan,
    status,
    trainer_name,
    join_date
FROM public.members
ORDER BY created_at DESC
LIMIT 10;
