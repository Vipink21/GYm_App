-- FIX MISSING USER ENTRY
-- Run this in Supabase to ensure public.users entry is always created

-- Drop old function signatures to prevent conflicts
DROP FUNCTION IF EXISTS create_new_gym(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, NUMERIC, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION create_new_gym(
    _owner_id UUID,
    _name TEXT,
    _owner_name TEXT,
    _location TEXT,
    _city TEXT,
    _type TEXT,
    _contact TEXT,
    _plan_id UUID,
    _price NUMERIC,
    _currency TEXT,
    _plan_details JSONB,
    _email TEXT, -- Ensure this is passed
    _phone TEXT,
    _address TEXT,
    _owner_city TEXT
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_gym_id UUID;
    new_sub_id UUID;
BEGIN
    -- 1. UPSERT into public.users
    -- This inserts the user if missing, or updates if they exist.
    INSERT INTO public.users (id, email, display_name, phone, address, city, role)
    VALUES (
        _owner_id, 
        _email, 
        _owner_name, 
        _phone, 
        _address, 
        _owner_city, 
        'gym_owner'
    )
    ON CONFLICT (id) DO UPDATE 
    SET 
        display_name = EXCLUDED.display_name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        city = EXCLUDED.city,
        role = 'gym_owner', -- Force correct role
        email = EXCLUDED.email; -- Ensure email is synced

    -- 2. Create Gym
    INSERT INTO public.gyms (
        owner_user_id, name, owner_name, location, city, type, contact_no, status, slug
    )
    VALUES (
        _owner_id, _name, _owner_name, _location, _city, _type, _contact, 'active', 'gym-' || substr(md5(random()::text), 0, 8)
    )
    RETURNING id INTO new_gym_id;

    -- 3. Create Subscription
    INSERT INTO public.gym_subscriptions (
        gym_id, plan_id, price, currency, plan_details, status, billing_cycle, start_date, auto_renew
    )
    VALUES (
        new_gym_id, _plan_id, _price, _currency, _plan_details, 'active', 'monthly', now(), true
    )
    RETURNING id INTO new_sub_id;

    -- 4. Link Gym back to User
    UPDATE public.users 
    SET gym_id = new_gym_id 
    WHERE id = _owner_id;

    RETURN jsonb_build_object('gym_id', new_gym_id, 'sub_id', new_sub_id);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_new_gym TO authenticated;
GRANT EXECUTE ON FUNCTION create_new_gym TO anon;
