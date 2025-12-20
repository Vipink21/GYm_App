-- Fix Razorpay Key Storage Issue
-- This script ensures system_settings table exists and Razorpay keys can be saved

-- Step 1: Create system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT '',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Insert default Razorpay settings (will be updated from admin panel)
INSERT INTO system_settings (key, value, description)
VALUES 
    ('razorpay_key_id', '', 'Razorpay API Key ID for payment processing'),
    ('razorpay_key_secret', '', 'Razorpay API Key Secret for backend verification')
ON CONFLICT (key) DO NOTHING;  -- Don't overwrite if already exists

-- Step 3: Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'system_settings'
ORDER BY ordinal_position;

-- Step 4: Check current settings
SELECT * FROM system_settings;

-- Expected output:
-- key                   | value | description
-- razorpay_key_id       | ''    | Razorpay API Key ID...
-- razorpay_key_secret   | ''    | Razorpay API Key Secret...

-- Step 5: Grant permissions (if needed)
-- Make sure the authenticated role can read/write to this table
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow super admin to manage settings" ON system_settings;
DROP POLICY IF EXISTS "Allow read access to settings" ON system_settings;

-- Create policies
-- Policy 1: Super admins can manage all settings
CREATE POLICY "Allow super admin to manage settings"
ON system_settings
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'superadmin'
    )
);

-- Policy 2: All authenticated users can read settings (for Razorpay key)
CREATE POLICY "Allow read access to settings"
ON system_settings
FOR SELECT
USING (auth.role() = 'authenticated');

-- Step 6: Verify policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'system_settings';

-- INSTRUCTIONS FOR ADMIN:
-- After running this script:
-- 1. Go to Super Admin → Settings
-- 2. Enter your Razorpay Key ID (from https://dashboard.razorpay.com)
-- 3. Click "Save Configuration"
-- 4. Refresh the registration page
-- 5. Try registration with a paid plan

-- To manually verify the key was saved:
-- SELECT * FROM system_settings WHERE key = 'razorpay_key_id';
