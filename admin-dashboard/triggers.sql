-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Allow admins/trainers to view members of their gym
CREATE POLICY "Admins can view gym members" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users AS viewer
      WHERE viewer.id = auth.uid()
      AND viewer.gym_id = users.gym_id
      AND viewer.role IN ('admin', 'superadmin', 'trainer')
    )
  );

-- Allow admins to insert/update/delete members
CREATE POLICY "Admins can manage members" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users AS viewer
      WHERE viewer.id = auth.uid()
      AND viewer.role IN ('admin', 'superadmin')
      AND (
         -- Allow creating members for their gym
         viewer.gym_id = users.gym_id 
         OR 
         -- For new inserts where we are setting the gym_id
         viewer.gym_id = users.gym_id
      )
    )
  );

-- Trigger to create public.users entry on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, display_name)
  VALUES (new.id, new.email, 'member', split_part(new.email, '@', 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if trigger exists before creating
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Helper to create a Gym for an Admin if none exists
CREATE OR REPLACE FUNCTION create_gym_for_admin()
RETURNS TRIGGER AS $$
DECLARE
  new_gym_id UUID;
BEGIN
  IF new.role = 'admin' OR new.role = 'superadmin' THEN
    -- Check if they already have one to avoid dupes on updates
    IF new.gym_id IS NULL THEN
        INSERT INTO gyms (name, slug, owner_user_id, status)
        VALUES ('My Gym', 'my-gym-' || substr(md5(random()::text), 0, 6), new.id, 'active')
        RETURNING id INTO new_gym_id;
        
        -- Update the admin with the new gym_id
        UPDATE users SET gym_id = new_gym_id WHERE id = new.id;
    END IF;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_admin_created ON public.users;
CREATE TRIGGER on_admin_created
  AFTER INSERT OR UPDATE OF role ON public.users
  FOR EACH ROW
  WHEN (pg_trigger_depth() < 1) -- Prevent infinite recursion
  EXECUTE PROCEDURE create_gym_for_admin();
