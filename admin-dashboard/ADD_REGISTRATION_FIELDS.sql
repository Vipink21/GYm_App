-- Add Gender and Address columns to users table
-- Run this in Supabase SQL Editor

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS address TEXT;
