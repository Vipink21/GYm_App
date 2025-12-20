-- Fix Payment Error: Configure Razorpay Key
-- Run this in Supabase SQL Editor

-- Step 1: Check if system_settings table exists
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Insert or update Razorpay key
-- IMPORTANT: Replace 'YOUR_RAZORPAY_KEY_HERE' with your actual Razorpay key
-- Test key format: rzp_test_xxxxxxxxxxxxx
-- Live key format: rzp_live_xxxxxxxxxxxxx

INSERT INTO system_settings (key, value, description)
VALUES (
    'razorpay_key_id',
    'YOUR_RAZORPAY_KEY_HERE',  -- ⚠️ REPLACE THIS with your actual key
    'Razorpay API Key ID for payment processing'
)
ON CONFLICT (key) 
DO UPDATE SET 
    value = 'YOUR_RAZORPAY_KEY_HERE',  -- ⚠️ REPLACE THIS with your actual key
    updated_at = NOW();

-- Step 3: Verify the key was inserted
SELECT * FROM system_settings WHERE key = 'razorpay_key_id';

-- Expected output:
-- key              | value                    | description
-- razorpay_key_id  | rzp_test_xxxxxxxxxxxxx  | Razorpay API Key ID for payment processing

-- Step 4: Check if payments table has required columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'payments'
ORDER BY ordinal_position;

-- If razorpay columns are missing, run the migration:
-- (This should already be done, but just in case)

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_signature TEXT,
ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES members(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);

-- Step 5: Verify everything is set up
SELECT 
    'Razorpay Key Configured' as status,
    CASE 
        WHEN value LIKE 'rzp_test_%' THEN '✅ Test Mode'
        WHEN value LIKE 'rzp_live_%' THEN '✅ Live Mode'
        ELSE '❌ Invalid Key Format'
    END as mode,
    LEFT(value, 15) || '...' as key_preview
FROM system_settings 
WHERE key = 'razorpay_key_id';

-- IMPORTANT NOTES:
-- 1. Get your Razorpay key from: https://dashboard.razorpay.com/app/keys
-- 2. Use TEST key for testing: rzp_test_xxxxxxxxxxxxx
-- 3. Use LIVE key for production: rzp_live_xxxxxxxxxxxxx
-- 4. Never commit or share your secret key (only use key_id in frontend)
-- 5. After running this, refresh your application (Ctrl+F5)

-- Troubleshooting:
-- If you see "Invalid Key Format", make sure your key starts with:
-- - rzp_test_ for test mode
-- - rzp_live_ for live mode
