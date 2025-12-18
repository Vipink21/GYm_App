-- Add detailed columns to 'gyms' table for comprehensive registration
-- Run this in Supabase SQL Editor

ALTER TABLE public.gyms 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'unisex', -- 'unisex', 'male', 'female'
ADD COLUMN IF NOT EXISTS contact_no VARCHAR(20);

-- Make sure user profiles also have 'city' if not already (we added address earlier)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS city VARCHAR(100);
