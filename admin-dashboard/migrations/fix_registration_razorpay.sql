-- ============================================
-- FIX: Razorpay Registration Payment Issue
-- ============================================
-- This script fixes the RLS policy to allow unauthenticated users
-- (during registration) to fetch the Razorpay key from the database.
--
-- SAFE: Only exposes the Razorpay Key ID (public key), not the secret
-- ============================================

-- Step 1: Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow read access to settings" ON system_settings;
DROP POLICY IF EXISTS "Allow public read of razorpay key" ON system_settings;
DROP POLICY IF EXISTS "Allow super admin full access to settings" ON system_settings;

-- Step 2: Create policy to allow public read of Razorpay key ONLY
-- This is safe because:
-- 1. Only the Key ID is exposed (not the secret)
-- 2. Key ID is meant to be public (used in frontend)
-- 3. Only the razorpay_key_id field is accessible, not other settings
CREATE POLICY "Allow public read of razorpay key"
ON system_settings
FOR SELECT
USING (key = 'razorpay_key_id');

-- Step 3: Keep super admin full access to ALL settings
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
    END as status,
    description
FROM system_settings 
WHERE key = 'razorpay_key_id';

-- Expected output:
-- key              | key_preview              | status              | description
-- razorpay_key_id  | rzp_test_RtquCrC1XAr...  | ✅ Valid Test Key  | Used for frontend...

-- Step 5: Verify all policies on system_settings
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'system_settings'
ORDER BY policyname;

-- Expected policies:
-- 1. "Allow public read of razorpay key" - SELECT - key = 'razorpay_key_id'
-- 2. "Allow super admin full access to settings" - ALL - role = 'superadmin'

-- ============================================
-- INSTRUCTIONS:
-- ============================================
-- 1. Copy this entire script
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Paste and click "Run"
-- 4. Verify you see "✅ Valid Test Key" in the output
-- 5. Restart your dev server (Ctrl+C, then npm run dev)
-- 6. Hard refresh registration page (Ctrl+F5)
-- 7. Try registration with a paid plan
-- 8. Check browser console - should show: "Using database key"
--
-- ============================================
-- SECURITY NOTE:
-- ============================================
-- This is safe because:
-- - Only the Razorpay Key ID is exposed (meant to be public)
-- - The Key Secret remains protected (only super admin can access)
-- - Other system settings remain protected
-- - This is standard practice for payment gateways (Stripe, Razorpay, etc.)
-- - The Key ID alone cannot be used to create payments or access funds
-- ============================================
