-- COMPLETE DATABASE SETUP FOR REGISTRATION (FIXED & ENHANCED)
-- Run this ENTIRE script in the Supabase SQL Editor

-- 0. CLEANUP: Drop existing functions to avoid "not unique" errors
DROP FUNCTION IF EXISTS create_new_gym(UUID, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS create_new_gym(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, NUMERIC, TEXT, JSONB);
DROP FUNCTION IF EXISTS create_new_gym(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, NUMERIC, TEXT, JSONB); -- With owner name

-- 1. Alter 'gym_subscriptions' to store Plan Snapshot Details (and gyms for owner_name)
ALTER TABLE public.gym_subscriptions
ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS plan_details JSONB;

-- Ensure gyms table has owner_name column
ALTER TABLE public.gyms
ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255);

-- 2. Create/Update the Secure Registration Function
CREATE OR REPLACE FUNCTION create_new_gym(
    _owner_id UUID,
    _name TEXT,
    _owner_name TEXT, -- NEW PARAMETER
    _location TEXT,
    _city TEXT,
    _type TEXT,
    _contact TEXT,
    _plan_id UUID,
    _price NUMERIC,
    _currency TEXT,
    _plan_details JSONB
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as Superuser to bypass RLS
SET search_path = public
AS $$
DECLARE
    new_gym_id UUID;
    new_sub_id UUID;
BEGIN
    -- Insert Gym
    INSERT INTO public.gyms (owner_user_id, name, owner_name, location, city, type, contact_no, status, slug)
    VALUES (
        _owner_id, 
        _name, 
        _owner_name, -- Save the Owner Name
        _location,
        _city, 
        _type, 
        _contact, 
        'active', 
        'gym-' || substr(md5(random()::text), 0, 8)
    )
    RETURNING id INTO new_gym_id;

    -- Insert Subscription with Snapshot Details
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

    RETURN jsonb_build_object('gym_id', new_gym_id, 'sub_id', new_sub_id);
END;
$$;

-- 3. Grant Execute Permission
GRANT EXECUTE ON FUNCTION create_new_gym TO authenticated;
GRANT EXECUTE ON FUNCTION create_new_gym TO anon;
