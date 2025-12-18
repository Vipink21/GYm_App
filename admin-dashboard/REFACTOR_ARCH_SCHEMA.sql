-- ================================================================
-- SAAS ARCHITECTURE REFACTOR (FIXED)
-- Separation of "Auth Profiles" and "Gym Members"
-- ================================================================

-- 1. Create 'members' table (For gym customers who don't log in)
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    gender VARCHAR(20),
    address TEXT,
    
    -- Membership Details
    member_plan VARCHAR(100),
    trainer_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    join_date DATE DEFAULT CURRENT_DATE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Migrate existing 'member' data - ONLY if Gym exists (Fixes FK Error)
INSERT INTO public.members (
    gym_id, full_name, first_name, last_name, email, phone, 
    gender, address, member_plan, trainer_name, status, created_at
)
SELECT 
    gym_id, display_name, first_name, last_name, email, phone, 
    gender, address, member_plan, trainer_name, status, created_at
FROM public.users
WHERE role = 'member'
AND gym_id IN (SELECT id FROM public.gyms) -- Safety check!
AND NOT EXISTS (SELECT 1 FROM public.members WHERE phone = users.phone); -- Avoid duplicates if re-run

-- 3. Enable RLS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Drop first to avoid errors on re-run)
DROP POLICY IF EXISTS "Owners manage own members" ON public.members;
DROP POLICY IF EXISTS "Super Admins view all members" ON public.members;

CREATE POLICY "Owners manage own members" ON public.members
FOR ALL
TO authenticated
USING (
    gym_id IN (
        SELECT id FROM public.gyms 
        WHERE owner_user_id = auth.uid()
    )
)
WITH CHECK (
    gym_id IN (
        SELECT id FROM public.gyms 
        WHERE owner_user_id = auth.uid()
    )
);

CREATE POLICY "Super Admins view all members" ON public.members
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'superadmin'
    )
);
