-- ================================================================
-- ROLE BASED ACCESS CONTROL (RBAC) SYSTEM
-- ================================================================

-- 1. Create Roles Table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Permissions Table
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'members.create'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Role_Permissions Mapping Table
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. Seed Standard Roles
INSERT INTO public.roles (name, description) VALUES
('super_admin', 'Platform Administrator with full access'),
('gym_owner', 'Owner of a specific Gym'),
('trainer', 'Gym Trainer with limited access'),
('staff', 'Front desk staff or manager')
ON CONFLICT (name) DO NOTHING;

-- 5. Seed Permissions (Granular)
INSERT INTO public.permissions (slug, description) VALUES
-- Members
('members.view', 'View members list'),
('members.create', 'Add new members'),
('members.edit', 'Edit member details'),
('members.delete', 'Remove members'),
-- Trainers
('trainers.view', 'View trainers'),
('trainers.manage', 'Add/Edit trainers'),
-- Financials
('payments.view', 'View payment history'),
('payments.manage', 'Process payments'),
-- Admin/Gym
('gym.settings', 'Manage gym settings'),
('plans.manage', 'Manage SaaS plans (Super Admin only)')
ON CONFLICT (slug) DO NOTHING;

-- 6. Assign Permissions to Roles (Helper block)
DO $$
DECLARE
    r_super_admin UUID;
    r_gym_owner UUID;
    r_trainer UUID;
    r_staff UUID;
BEGIN
    SELECT id INTO r_super_admin FROM public.roles WHERE name = 'super_admin';
    SELECT id INTO r_gym_owner FROM public.roles WHERE name = 'gym_owner';
    SELECT id INTO r_trainer FROM public.roles WHERE name = 'trainer';
    SELECT id INTO r_staff FROM public.roles WHERE name = 'staff';

    -- SUPER ADMIN: Give ALL permissions
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_super_admin, id FROM public.permissions
    ON CONFLICT DO NOTHING;

    -- GYM OWNER: Give most permissions (except SaaS plan management)
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_gym_owner, id FROM public.permissions 
    WHERE slug != 'plans.manage'
    ON CONFLICT DO NOTHING;

    -- TRAINER: View access mostly
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_trainer, id FROM public.permissions 
    WHERE slug IN ('members.view', 'trainers.view')
    ON CONFLICT DO NOTHING;

    -- STAFF: Operational access
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_staff, id FROM public.permissions 
    WHERE slug IN ('members.view', 'members.create', 'members.edit', 'payments.view', 'payments.manage')
    ON CONFLICT DO NOTHING;
END $$;

-- 7. Create Helper Function to Check Permission
-- Usage: SELECT user_has_permission(auth.uid(), 'members.create')
CREATE OR REPLACE FUNCTION public.user_has_permission(
    _user_id UUID,
    _permission_slug TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    _user_role TEXT;
BEGIN
    -- Get user role name from users table
    SELECT role INTO _user_role FROM public.users WHERE id = _user_id;
    
    -- If user or role not found, return false
    IF _user_role IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Check if that role has the permission
    RETURN EXISTS (
        SELECT 1
        FROM public.role_permissions rp
        JOIN public.roles r ON rp.role_id = r.id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE r.name = _user_role
        AND p.slug = _permission_slug
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
