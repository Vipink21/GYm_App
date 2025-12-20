# 🔧 Fix: Gym Subscription Display Issue

**Problem**: All gyms showing "Free Tier" instead of their actual chosen plans  
**Date**: December 20, 2025

---

## 🎯 Root Cause

The gyms in your database **do not have active subscriptions** assigned to them. The query is working correctly, but there's no subscription data to display.

---

## ✅ Solution Steps

### **Step 1: Check Browser Console**

1. Open the Super Admin Dashboard (`http://localhost:3000/admin`)
2. Open Browser DevTools (F12)
3. Go to the **Console** tab
4. Look for these debug messages:

```
📊 Raw gym data from database: [...]
🏢 Gym: Muscle Hut
   Total subscriptions: 0
   Active subscriptions: 0
🏢 Gym: Arnold GYM
   Total subscriptions: 0
   Active subscriptions: 0
```

If you see **"Total subscriptions: 0"**, it confirms the gyms have no subscriptions in the database.

---

### **Step 2: Run SQL Script in Supabase**

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Open the file: `FIX_GYM_SUBSCRIPTIONS.sql`
4. **Copy and paste** the SQL script
5. Click **Run**

This will:
- ✅ Create a "Free Tier" plan if it doesn't exist
- ✅ Assign "Free Tier" to all gyms without active subscriptions
- ✅ Show you a verification query

---

### **Step 3: Verify the Fix**

After running the SQL script, you should see output like:

```sql
| gym_id | gym_name    | status | plan_name  | start_date | end_date |
|--------|-------------|--------|------------|------------|----------|
| uuid1  | Muscle Hut  | active | Free Tier  | 2025-12-20 | 2125-12-20 |
| uuid2  | Arnold GYM  | active | Free Tier  | 2025-12-20 | 2125-12-20 |
| uuid3  | SUPER DEN   | active | Free Tier  | 2025-12-20 | 2125-12-20 |
```

---

### **Step 4: Refresh Dashboard**

1. Go back to the Super Admin Dashboard
2. **Hard refresh** the page (Ctrl + Shift + R)
3. Check the console again - you should now see:

```
🏢 Gym: Muscle Hut
   Total subscriptions: 1
   Active subscriptions: 1
   Plan: Free Tier
```

4. The dashboard should now show **"Free Tier"** badges (but this time with actual data!)

---

### **Step 5: Upgrade Gyms to Paid Plans (Optional)**

If you want to test different plan types, run these SQL commands:

#### **Create Sample Plans** (if they don't exist):

```sql
INSERT INTO saas_plans (name, description, price_monthly, price_yearly, max_members_per_gym, max_trainers_per_gym, is_active)
VALUES 
    ('Starter', 'Perfect for small gyms', 999, 9999, 200, 5, true),
    ('Professional', 'For growing fitness centers', 2999, 29999, 500, 15, true),
    ('Enterprise', 'For large gym chains', 9999, 99999, 2000, 50, true)
ON CONFLICT (name) DO NOTHING;
```

#### **Upgrade Specific Gyms**:

```sql
-- Upgrade "Muscle Hut" to Enterprise
UPDATE gym_subscriptions 
SET plan_id = (SELECT id FROM saas_plans WHERE name = 'Enterprise' LIMIT 1)
WHERE gym_id = (SELECT id FROM gyms WHERE name = 'Muscle Hut' LIMIT 1)
AND status = 'active';

-- Upgrade "Arnold GYM" to Professional
UPDATE gym_subscriptions 
SET plan_id = (SELECT id FROM saas_plans WHERE name = 'Professional' LIMIT 1)
WHERE gym_id = (SELECT id FROM gyms WHERE name = 'Arnold GYM' LIMIT 1)
AND status = 'active';

-- Keep "SUPER DEN" on Free Tier (no action needed)
```

---

### **Step 6: Verify Color-Coded Badges**

After upgrading plans, refresh the dashboard and you should see:

- **Muscle Hut** → 🟣 Purple badge ("Enterprise")
- **Arnold GYM** → 🔵 Blue badge ("Professional")
- **SUPER DEN** → 🟡 Gold badge ("Free Tier")

---

## 🔍 Debugging Checklist

If the issue persists, check these:

### **1. Database Schema**

Ensure these tables exist:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('gyms', 'gym_subscriptions', 'saas_plans');
```

### **2. Foreign Key Relationships**

```sql
-- Check foreign keys
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('gym_subscriptions');
```

### **3. RLS Policies**

Check if Row Level Security is blocking the query:

```sql
-- Temporarily disable RLS for testing (ONLY IN DEVELOPMENT!)
ALTER TABLE gym_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE saas_plans DISABLE ROW LEVEL SECURITY;

-- After testing, re-enable:
ALTER TABLE gym_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_plans ENABLE ROW LEVEL SECURITY;
```

### **4. Supabase Service Role**

Ensure your Supabase client is using the correct API key:

```typescript
// In src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## 📊 Expected Database Structure

### **`saas_plans` Table**:
```sql
CREATE TABLE saas_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    price_monthly NUMERIC DEFAULT 0,
    price_yearly NUMERIC DEFAULT 0,
    max_members_per_gym INTEGER DEFAULT 50,
    max_trainers_per_gym INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **`gym_subscriptions` Table**:
```sql
CREATE TABLE gym_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES saas_plans(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚀 Quick Fix Command

If you just want to quickly fix the issue, run this single command in Supabase SQL Editor:

```sql
-- One-liner to fix everything
WITH free_plan AS (
    INSERT INTO saas_plans (name, description, price_monthly, price_yearly, max_members_per_gym, max_trainers_per_gym, is_active)
    VALUES ('Free Tier', 'Basic free plan', 0, 0, 50, 2, true)
    ON CONFLICT (name) DO UPDATE SET name = 'Free Tier'
    RETURNING id
)
INSERT INTO gym_subscriptions (gym_id, plan_id, status, start_date, end_date)
SELECT g.id, fp.id, 'active', NOW(), NOW() + INTERVAL '100 years'
FROM gyms g, free_plan fp
WHERE NOT EXISTS (
    SELECT 1 FROM gym_subscriptions gs 
    WHERE gs.gym_id = g.id AND gs.status = 'active'
);
```

---

## ✅ Success Criteria

After following these steps, you should see:

1. ✅ Console logs showing subscription data
2. ✅ All gyms have at least one active subscription
3. ✅ Dashboard displays actual plan names (not just "Free Tier")
4. ✅ Color-coded badges based on plan tier
5. ✅ No errors in browser console

---

## 📝 Notes

- The debug logging will be automatically removed in production builds
- You can remove the console.log statements from `adminService.ts` once the issue is resolved
- The SQL script is safe to run multiple times (uses `ON CONFLICT` and `NOT EXISTS`)

---

**Status**: Ready to Fix  
**Estimated Time**: 5-10 minutes  
**Risk Level**: Low (non-destructive changes)
