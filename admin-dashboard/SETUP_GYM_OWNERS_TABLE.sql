-- dedicated Gym Owners table and updated registration function
-- Run this in Supabase SQL Editor

-- 1. Create Gym Owners Table
CREATE TABLE IF NOT EXISTS public.gym_owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.gym_owners ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can view/edit their own data
CREATE POLICY "Owners manage own profile" ON public.gym_owners
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- 2. Update Registration Function to use this new table
-- First, drop old signature to avoid ambiguity
DROP FUNCTION IF EXISTS create_new_gym(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, NUMERIC, TEXT, JSONB);

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
    -- New params for Gym Owner Profile
    _email TEXT,
    _phone TEXT,
    _address TEXT,
    _owner_city TEXT
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as Superuser
SET search_path = public
AS $$
DECLARE
    new_gym_id UUID;
    new_sub_id UUID;
BEGIN
    -- 1. Save Owner Details to 'gym_owners' table
    INSERT INTO public.gym_owners (user_id, full_name, email, phone, address, city)
    VALUES (_owner_id, _owner_name, _email, _phone, _address, _owner_city)
    ON CONFLICT (user_id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        city = EXCLUDED.city;

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

    RETURN jsonb_build_object('gym_id', new_gym_id, 'sub_id', new_sub_id);
END;
$$;

-- Grant permissions again just in case
GRANT EXECUTE ON FUNCTION create_new_gym TO authenticated;
GRANT EXECUTE ON FUNCTION create_new_gym TO anon;
