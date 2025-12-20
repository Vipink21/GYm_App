-- ============================================================
-- SYNC GYM LOCATION DATA FROM OWNERS
-- Use this to fill in missing location data on the dashboard
-- ============================================================

-- 1. Sync city and location from the owner's record
-- We check if gym location/city is empty and try to get it from the 'users' table
UPDATE public.gyms g
SET 
  city = COALESCE(g.city, u.city, 'Not specified'),
  location = COALESCE(g.location, u.address, 'Not specified')
FROM public.users u
WHERE g.owner_user_id = u.id
AND (g.city IS NULL OR g.city = '' OR g.location IS NULL OR g.location = '');

-- 2. Verify results
SELECT name, city, location FROM gyms;
