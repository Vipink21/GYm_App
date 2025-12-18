-- Helper Function to Create Gym AND Subscription (Transaction)
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION create_new_gym(
    _owner_id UUID,
    _name TEXT,
    _location TEXT,
    _city TEXT,
    _type TEXT,
    _contact TEXT,
    -- Subscription Params
    _plan_id UUID,
    _price NUMERIC,
    _currency TEXT,
    _plan_details JSONB
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Critical: Runs as Superuser, bypassing RLS
SET search_path = public
AS $$
DECLARE
    new_gym_id UUID;
    new_sub_id UUID;
BEGIN
    -- 1. Insert the Gym
    INSERT INTO public.gyms (owner_user_id, name, location, city, type, contact_no, status, slug)
    VALUES (
        _owner_id, 
        _name, 
        _location,
        _city, 
        _type, 
        _contact, 
        'active', 
        'gym-' || substr(md5(random()::text), 0, 8)
    )
    RETURNING id INTO new_gym_id;

    -- 2. Insert the Subscription
    INSERT INTO public.gym_subscriptions (
        gym_id, 
        plan_id, 
        price, 
        currency, 
        plan_details, 
        status, 
        billing_cycle, 
        start_date, 
        auto_renew
    )
    VALUES (
        new_gym_id, 
        _plan_id, 
        _price, 
        _currency, 
        _plan_details, 
        'active', 
        'monthly', 
        now(), 
        true
    )
    RETURNING id INTO new_sub_id;

    -- Return the result
    RETURN jsonb_build_object('gym_id', new_gym_id, 'sub_id', new_sub_id);
END;
$$;
