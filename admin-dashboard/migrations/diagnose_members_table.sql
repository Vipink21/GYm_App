-- Check members table and data
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if members table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'members'
) as members_table_exists;

-- 2. Check the members table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'members'
ORDER BY ordinal_position;

-- 3. Count total members
SELECT COUNT(*) as total_members FROM public.members;

-- 4. Show sample members data (limit 5)
SELECT 
    id,
    gym_id,
    full_name,
    email,
    phone,
    member_plan,
    status,
    trainer_name,
    join_date,
    created_at
FROM public.members
ORDER BY created_at DESC
LIMIT 5;

-- 5. Check RLS policies on members table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'members';

-- 6. Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'members';
