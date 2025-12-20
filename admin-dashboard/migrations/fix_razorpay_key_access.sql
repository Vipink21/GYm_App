-- FIX: Allow Registration Page to Access Razorpay Key
-- This fixes the RLS policy so unauthenticated users can fetch the Razorpay key during registration

-- Step 1: Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow read access to settings" ON system_settings;
DROP POLICY IF EXISTS "Allow public read of razorpay key" ON system_settings;

-- Step 2: Create policy to allow public read of Razorpay key ONLY
-- This is safe because:
-- 1. Only the Key ID is exposed (not the secret)
-- 2. Key ID is meant to be public (used in frontend)
-- 3. Only the razorpay_key_id field is accessible, not other settings
CREATE POLICY "Allow public read of razorpay key"
ON system_settings
FOR SELECT
USING (key = 'razorpay_key_id');

-- Step 3: Keep super admin full access
CREATE POLICY "Allow super admin full access to settings"
ON system_settings
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'superadmin'
    )
);

-- Step 4: Verify the key exists and is accessible
SELECT 
    key,
    LEFT(value, 20) || '...' as key_preview,
    CASE 
        WHEN value LIKE 'rzp_test_%' THEN '✅ Valid Test Key'
        WHEN value LIKE 'rzp_live_%' THEN '✅ Valid Live Key'
        WHEN value = '' THEN '⚠️ Empty - Please add key in Super Admin Settings'
        ELSE '❌ Invalid Format'
    END as status
FROM system_settings 
WHERE key = 'razorpay_key_id';

-- Expected output:
-- key              | key_preview              | status
-- razorpay_key_id  | rzp_test_RtquCrC1XAr...  | ✅ Valid Test Key

-- Step 5: Test the policy (this should work now even without authentication)
-- You can test this by refreshing the registration page

-- Step 6: Verify all policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'system_settings'
ORDER BY policyname;

-- INSTRUCTIONS:
-- 1. Copy this entire script
-- 2. Go to Supabase → SQL Editor
-- 3. Paste and click "Run"
-- 4. Verify you see "✅ Valid Test Key" in the output
-- 5. Refresh your registration page (Ctrl+F5)
-- 6. Try registration with a paid plan
-- 7. Check console - should now show your actual key instead of placeholder

-- SECURITY NOTE:
-- This is safe because:
-- - Only the Razorpay Key ID is exposed (meant to be public)
-- - The Key Secret remains protected (only super admin can access)
-- - Other system settings remain protected
-- - This is standard practice for payment gateways (Stripe, Razorpay, etc.)
