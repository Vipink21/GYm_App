-- FIX: MISSING FOREIGN KEY & DATA FETCH
-- This script ensures the database relationship is formally defined so the dashboard can show data

-- 1. Ensure the Foreign Key exists (Required for Supabase Joins)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'gyms_owner_user_id_fkey') THEN
        ALTER TABLE public.gyms 
        ADD CONSTRAINT gyms_owner_user_id_fkey 
        FOREIGN KEY (owner_user_id) 
        REFERENCES public.users(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Ensure Subscription link to Plans exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'gym_subscriptions_plan_id_fkey') THEN
        ALTER TABLE public.gym_subscriptions 
        ADD CONSTRAINT gym_subscriptions_plan_id_fkey 
        FOREIGN KEY (plan_id) 
        REFERENCES public.saas_plans(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

-- 4. Verify the registered user exists and has the correct role
-- (Replace ravi21@gmail.com with your actual test email if different)
UPDATE public.users 
SET role = 'gym_owner' 
WHERE email = 'ravi21@gmail.com';

-- 5. Final check on Super Admin role
UPDATE public.users 
SET role = 'superadmin' 
WHERE email = 'admin@fitzone.com';
