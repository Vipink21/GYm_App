-- ================================================
-- ADMIN PLAN MANAGEMENT PERMISSIONS
-- Allow SaaS Super Admin to manage subscription plans
-- ================================================

-- ============================================
-- STEP 1: ADD SUPER ADMIN RLS POLICIES
-- ============================================

-- Allow super_admin to INSERT new plans
DROP POLICY IF EXISTS "Super admins can create plans" ON saas_plans;
CREATE POLICY "Super admins can create plans" ON saas_plans
FOR INSERT 
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'superadmin'
    )
);

-- Allow super_admin to UPDATE existing plans
DROP POLICY IF EXISTS "Super admins can update plans" ON saas_plans;
CREATE POLICY "Super admins can update plans" ON saas_plans
FOR UPDATE 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'superadmin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'superadmin'
    )
);

-- Allow super_admin to DELETE plans (if needed)
DROP POLICY IF EXISTS "Super admins can delete plans" ON saas_plans;
CREATE POLICY "Super admins can delete plans" ON saas_plans
FOR DELETE 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'superadmin'
    )
);

-- ============================================
-- STEP 2: CREATE PLAN CHANGE HISTORY TABLE
-- ============================================
-- Track all pricing changes for audit purposes

CREATE TABLE IF NOT EXISTS plan_change_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES saas_plans(id) ON DELETE CASCADE,
    changed_by UUID NOT NULL REFERENCES users(id),
    field_name VARCHAR(50) NOT NULL, -- 'price_monthly', 'price_yearly', 'max_members', etc.
    old_value TEXT,
    new_value TEXT,
    change_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for audit queries
CREATE INDEX IF NOT EXISTS idx_plan_change_history_plan_id ON plan_change_history(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_change_history_changed_by ON plan_change_history(changed_by);

-- RLS for plan change history
ALTER TABLE plan_change_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins can view plan history" ON plan_change_history;
CREATE POLICY "Super admins can view plan history" ON plan_change_history
FOR SELECT 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'superadmin'
    )
);

-- ============================================
-- STEP 3: CREATE TRIGGER TO LOG PLAN CHANGES
-- ============================================

CREATE OR REPLACE FUNCTION log_plan_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log price_monthly changes
    IF OLD.price_monthly IS DISTINCT FROM NEW.price_monthly THEN
        INSERT INTO plan_change_history (plan_id, changed_by, field_name, old_value, new_value)
        VALUES (NEW.id, auth.uid(), 'price_monthly', OLD.price_monthly::TEXT, NEW.price_monthly::TEXT);
    END IF;
    
    -- Log price_yearly changes
    IF OLD.price_yearly IS DISTINCT FROM NEW.price_yearly THEN
        INSERT INTO plan_change_history (plan_id, changed_by, field_name, old_value, new_value)
        VALUES (NEW.id, auth.uid(), 'price_yearly', OLD.price_yearly::TEXT, NEW.price_yearly::TEXT);
    END IF;
    
    -- Log max_members changes
    IF OLD.max_members_per_gym IS DISTINCT FROM NEW.max_members_per_gym THEN
        INSERT INTO plan_change_history (plan_id, changed_by, field_name, old_value, new_value)
        VALUES (NEW.id, auth.uid(), 'max_members_per_gym', OLD.max_members_per_gym::TEXT, NEW.max_members_per_gym::TEXT);
    END IF;
    
    -- Log max_trainers changes
    IF OLD.max_trainers_per_gym IS DISTINCT FROM NEW.max_trainers_per_gym THEN
        INSERT INTO plan_change_history (plan_id, changed_by, field_name, old_value, new_value)
        VALUES (NEW.id, auth.uid(), 'max_trainers_per_gym', OLD.max_trainers_per_gym::TEXT, NEW.max_trainers_per_gym::TEXT);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS log_saas_plan_changes ON saas_plans;
CREATE TRIGGER log_saas_plan_changes
    AFTER UPDATE ON saas_plans
    FOR EACH ROW
    EXECUTE FUNCTION log_plan_changes();

-- ============================================
-- VERIFICATION
-- ============================================

-- Test: View all plans (works for everyone)
SELECT name, price_monthly, price_yearly FROM saas_plans;

-- Test: View change history (only super admins)
SELECT * FROM plan_change_history ORDER BY created_at DESC LIMIT 10;
