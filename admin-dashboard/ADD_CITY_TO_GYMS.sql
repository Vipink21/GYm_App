-- Add 'city' column to the 'gyms' table
-- Run this in Supabase SQL Editor

ALTER TABLE public.gyms 
ADD COLUMN IF NOT EXISTS city VARCHAR(100);

-- Note: You can now update your frontend code to read/write to this column.
