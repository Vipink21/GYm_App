-- Allow public read access to SaaS Plans (for Registration Page)
-- Run this in Supabase SQL Editor

DROP POLICY IF EXISTS "Anyone can view active plans" ON saas_plans;

CREATE POLICY "Anyone can view active plans" ON saas_plans
FOR SELECT 
TO anon, authenticated
USING (is_active = true);
