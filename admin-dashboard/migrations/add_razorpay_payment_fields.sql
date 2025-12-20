-- Migration: Add Razorpay payment fields to payments table
-- This ensures the payments table has all necessary columns for Razorpay integration

-- Add Razorpay-specific columns if they don't exist
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_signature TEXT,
ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES members(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_gym_id ON payments(gym_id);

-- Add comment to table
COMMENT ON TABLE payments IS 'Stores all payment transactions including Razorpay payments for member registrations and subscriptions';

-- Add comments to columns
COMMENT ON COLUMN payments.razorpay_order_id IS 'Razorpay order ID for tracking';
COMMENT ON COLUMN payments.razorpay_payment_id IS 'Razorpay payment ID after successful payment';
COMMENT ON COLUMN payments.razorpay_signature IS 'Razorpay signature for payment verification';
COMMENT ON COLUMN payments.member_id IS 'Reference to the member this payment is for (if applicable)';

-- Ensure payment_method column accepts 'razorpay'
-- If you have a CHECK constraint, update it:
-- ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_method_check;
-- ALTER TABLE payments ADD CONSTRAINT payments_payment_method_check 
--   CHECK (payment_method IN ('cash', 'card', 'upi', 'razorpay', 'online', 'bank_transfer'));

-- Sample query to verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'payments'
ORDER BY ordinal_position;
