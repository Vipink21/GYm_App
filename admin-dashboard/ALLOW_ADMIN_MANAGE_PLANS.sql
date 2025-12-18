-- Allow Super Admins to Manage (Add/Edit) SaaS Plans
-- Run this in Supabase SQL Editor

-- 1. Ensure RLS is enabled
ALTER TABLE public.saas_plans ENABLE ROW LEVEL SECURITY;

-- 2. Create Policy for Super Admins (Full Access: Select, Insert, Update, Delete)
-- We check if the user has the 'superadmin' role in the public.users table.

DROP POLICY IF EXISTS "Super Admins can manage plans" ON saas_plans;

CREATE POLICY "Super Admins can manage plans" ON public.saas_plans
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'superadmin' 
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'superadmin' 
  )
);
