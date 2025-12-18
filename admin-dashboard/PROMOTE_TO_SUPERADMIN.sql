-- Promote 'admin@fitzone.com' to Super Admin
-- Run this in Supabase SQL Editor

-- 1. Update the User's Role in 'users' table (Used by Frontend)
UPDATE public.users 
SET role = 'superadmin' 
WHERE email = 'admin@fitzone.com';

-- 2. Ensure 'superadmin' (no underscore) exists in RBAC roles table
INSERT INTO public.roles (name, description) 
VALUES ('superadmin', 'System Super Admin')
ON CONFLICT (name) DO NOTHING;

-- 3. Grant ALL permissions to 'superadmin'
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p
WHERE r.name = 'superadmin'
ON CONFLICT DO NOTHING;
