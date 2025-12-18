-- 1. Add trainer_details to users if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS trainer_details JSONB DEFAULT '{}'::jsonb;

-- 2. Create Classes table
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id),
    name VARCHAR NOT NULL,
    description TEXT,
    trainer_user_id UUID REFERENCES users(id),
    schedule_time TIMESTAMPTZ,
    duration_min INTEGER DEFAULT 60,
    capacity INTEGER DEFAULT 20,
    enrolled_count INTEGER DEFAULT 0,
    status VARCHAR DEFAULT 'scheduled', -- scheduled, cancelled, completed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on classes
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Policies for Classes
DROP POLICY IF EXISTS "Manage classes" ON classes;
CREATE POLICY "Manage classes" ON classes
FOR ALL USING (
  gym_id IN (select claim_gym_id from get_my_claims())
  AND (select claim_role from get_my_claims()) IN ('admin', 'superadmin', 'trainer')
);

DROP POLICY IF EXISTS "View classes" ON classes;
CREATE POLICY "View classes" ON classes
FOR SELECT USING (
  gym_id IN (select claim_gym_id from get_my_claims())
);

-- 3. Create Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id),
    user_id UUID REFERENCES users(id),
    type VARCHAR DEFAULT 'gym_visit', -- gym_visit, class
    reference_id UUID, -- class_id if type is class
    check_in_time TIMESTAMPTZ DEFAULT NOW(),
    check_out_time TIMESTAMPTZ,
    status VARCHAR DEFAULT 'present' -- present, absent (for classes), checked_out
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Manage attendance" ON attendance;
CREATE POLICY "Manage attendance" ON attendance
FOR ALL USING (
  gym_id IN (select claim_gym_id from get_my_claims())
  AND (select claim_role from get_my_claims()) IN ('admin', 'superadmin', 'trainer')
);

-- 4. Create Payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id),
    user_id UUID REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR DEFAULT 'USD',
    status VARCHAR DEFAULT 'completed', -- pending, completed, failed, refunded
    payment_method VARCHAR, -- cash, card, bank_transfer
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    description TEXT
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Manage payments" ON payments;
CREATE POLICY "Manage payments" ON payments
FOR ALL USING (
  gym_id IN (select claim_gym_id from get_my_claims())
  AND (select claim_role from get_my_claims()) IN ('admin', 'superadmin')
);
