-- Create membership_plans table for gym-specific membership plans
-- This is different from saas_plans which are platform-level subscription plans

CREATE TABLE IF NOT EXISTS public.membership_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration_months INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_membership_plans_gym_id ON public.membership_plans(gym_id);
CREATE INDEX IF NOT EXISTS idx_membership_plans_is_active ON public.membership_plans(is_active);

-- Enable Row Level Security
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;

-- Policy: Gym owners can view their own gym's membership plans
CREATE POLICY "Gym owners can view their membership plans"
    ON public.membership_plans
    FOR SELECT
    USING (
        gym_id IN (
            SELECT id FROM public.gyms 
            WHERE owner_id = auth.uid()
        )
    );

-- Policy: Gym owners can insert membership plans for their gym
CREATE POLICY "Gym owners can create membership plans"
    ON public.membership_plans
    FOR INSERT
    WITH CHECK (
        gym_id IN (
            SELECT id FROM public.gyms 
            WHERE owner_id = auth.uid()
        )
    );

-- Policy: Gym owners can update their gym's membership plans
CREATE POLICY "Gym owners can update their membership plans"
    ON public.membership_plans
    FOR UPDATE
    USING (
        gym_id IN (
            SELECT id FROM public.gyms 
            WHERE owner_id = auth.uid()
        )
    );

-- Policy: Gym owners can delete their gym's membership plans
CREATE POLICY "Gym owners can delete their membership plans"
    ON public.membership_plans
    FOR DELETE
    USING (
        gym_id IN (
            SELECT id FROM public.gyms 
            WHERE owner_id = auth.uid()
        )
    );

-- Policy: Super admins can do everything
CREATE POLICY "Super admins have full access to membership plans"
    ON public.membership_plans
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'superadmin'
        )
    );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_membership_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER membership_plans_updated_at
    BEFORE UPDATE ON public.membership_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_membership_plans_updated_at();

-- Insert some sample membership plans for testing
-- Note: Replace the gym_id with an actual gym ID from your database
-- You can find gym IDs by running: SELECT id, name FROM public.gyms;

-- Example sample plans (commented out - uncomment and update gym_id to use):
/*
INSERT INTO public.membership_plans (gym_id, name, description, duration_months, price, features, is_active)
VALUES 
    ('YOUR_GYM_ID_HERE', 'Monthly Basic', 'Basic gym access for 1 month', 1, 1500, 
     '["Access to all equipment", "Locker facility", "Basic fitness consultation"]'::jsonb, true),
    
    ('YOUR_GYM_ID_HERE', 'Quarterly Gold', 'Premium access for 3 months', 3, 4000, 
     '["Access to all equipment", "Locker facility", "Personal trainer sessions (2/month)", "Diet consultation", "Group classes"]'::jsonb, true),
    
    ('YOUR_GYM_ID_HERE', 'Annual Platinum', 'Best value - Full year access', 12, 15000, 
     '["Access to all equipment", "Locker facility", "Personal trainer sessions (4/month)", "Diet consultation", "Group classes", "Spa access", "Priority booking"]'::jsonb, true);
*/
