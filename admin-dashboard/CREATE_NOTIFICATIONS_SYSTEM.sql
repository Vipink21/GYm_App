-- ============================================================
-- GLOBAL NOTIFICATION SYSTEM
-- Tracks alerts for Super Admins and Gym Owners
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_role TEXT, -- 'superadmin' for platform alerts, 'gym_owner' for specific ones
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info', -- info, success, warning, error
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT, -- Optional URL to navigate to
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Super Admin can see ALL notifications
CREATE POLICY "Super Admin View All Notifications" 
ON public.notifications FOR ALL 
USING (public.is_super_admin_v5());

-- Users can see their own notifications
CREATE POLICY "Users View Own Notifications" 
ON public.notifications FOR ALL 
USING (auth.uid() = user_id);

-- AUTOMATIC TRIGGERS
-- 1. Notify Super Admin on New Gym Registration
CREATE OR REPLACE FUNCTION public.notify_super_admin_new_gym()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (target_role, title, message, type, link)
  VALUES ('superadmin', 'New Gym Registered', 'A new partner "' || NEW.name || '" has joined the platform.', 'success', '/admin/gyms');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER tr_on_gym_created
AFTER INSERT ON public.gyms
FOR EACH ROW EXECUTE FUNCTION public.notify_super_admin_new_gym();

-- 2. Notify Super Admin on Payment success
CREATE OR REPLACE FUNCTION public.notify_super_admin_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    INSERT INTO public.notifications (target_role, title, message, type, link)
    VALUES ('superadmin', 'Payment Received', '₹' || NEW.amount || ' received from gym.', 'info', '/admin/subscriptions');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER tr_on_payment_received
AFTER INSERT OR UPDATE ON public.subscription_payments
FOR EACH ROW EXECUTE FUNCTION public.notify_super_admin_payment();
