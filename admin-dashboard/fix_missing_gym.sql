-- Run this in your Supabase SQL Editor to fix missing user/gym data

-- 1. Ensure all Auth Users have a Public User record
INSERT INTO public.users (id, email, role, display_name)
SELECT id, email, 'admin', split_part(email, '@', 1)
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);

-- 2. Create Gyms for any Admins who don't have one
DO $$
DECLARE
    u record;
    new_gym_id uuid;
BEGIN
    FOR u IN SELECT * FROM public.users WHERE role IN ('admin', 'superadmin') AND gym_id IS NULL LOOP
        -- Create a Gym for this user
        INSERT INTO gyms (name, slug, owner_user_id, status)
        VALUES ('My Gym', 'gym-' || substr(md5(random()::text), 1, 6), u.id, 'active')
        RETURNING id INTO new_gym_id;

        -- Update the user with the new Gym ID
        UPDATE public.users SET gym_id = new_gym_id WHERE id = u.id;
        
        RAISE NOTICE 'Created Gym % for User %', new_gym_id, u.email;
    END LOOP;
END $$;
