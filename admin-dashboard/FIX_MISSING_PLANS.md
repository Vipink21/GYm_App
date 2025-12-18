# 🔧 Fix: Plans Not Showing - Database Setup Required

## ❌ Problem
The pricing plan cards are not displaying on your PlansPage because the `saas_plans` table is empty or doesn't exist in your Supabase database.

## ✅ Solution
You need to run the SQL migration to create the tables and insert the plan data.

---

## 📋 Step-by-Step Fix

### **Step 1: Open Supabase SQL Editor**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### **Step 2: Run the Migration**

Copy and paste this SQL code into the editor:

```sql
-- ============================================
-- CREATE SAAS_PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS saas_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2),
    max_gyms INTEGER DEFAULT 1,
    max_members_per_gym INTEGER,
    max_trainers_per_gym INTEGER,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INSERT INDIAN MARKET PLANS
-- ============================================
INSERT INTO saas_plans (name, description, price_monthly, price_yearly, max_gyms, max_members_per_gym, max_trainers_per_gym, features) VALUES
('Free', 'Perfect for getting started', 0, 0, 1, 50, 2, 
 '["Basic Dashboard", "Member Management (up to 50)", "Attendance Tracking", "Basic Reports", "WhatsApp Support"]'::jsonb),

('Basic', 'For small gyms', 999, 9990, 1, 200, 5, 
 '["Everything in Free", "Member Management (up to 200)", "Trainer Management (up to 5)", "Class Scheduling", "Payment Tracking", "SMS Notifications", "Email Support"]'::jsonb),

('Pro', 'For growing gyms', 2499, 24990, 3, 1000, 20, 
 '["Everything in Basic", "Multi-Location (up to 3 gyms)", "Member Management (up to 1000)", "WhatsApp Notifications", "SMS & Email Notifications", "Advanced Analytics", "Custom Reports", "UPI Payment Integration", "Priority Support"]'::jsonb),

('Enterprise', 'For gym chains', 6999, 69990, 999, 999999, 999, 
 '["Everything in Pro", "Unlimited Locations", "Unlimited Members", "Unlimited Trainers", "Custom Branding", "API Access", "Dedicated Account Manager", "24/7 Priority Support", "Custom Integrations", "Razorpay/PhonePe Integration"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE saas_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active plans" ON saas_plans;
CREATE POLICY "Anyone can view active plans" ON saas_plans
FOR SELECT TO authenticated USING (is_active = true);

-- ============================================
-- VERIFY DATA
-- ============================================
SELECT 
    name AS "Plan Name", 
    CONCAT('₹', price_monthly) AS "Monthly Price",
    CONCAT('₹', price_yearly) AS "Yearly Price",
    max_members_per_gym AS "Max Members", 
    max_trainers_per_gym AS "Max Trainers"
FROM saas_plans 
ORDER BY price_monthly;
```

### **Step 3: Run the Query**

1. Click the **"Run"** button (or press `Ctrl+Enter`)
2. Wait for the query to complete
3. You should see a success message
4. At the bottom, you'll see a table showing the 4 plans

### **Step 4: Verify the Data**

Run this query to confirm the plans were created:

```sql
SELECT * FROM saas_plans ORDER BY price_monthly;
```

You should see 4 rows:
- Free (₹0)
- Basic (₹999)
- Pro (₹2,499)
- Enterprise (₹6,999)

### **Step 5: Refresh Your Browser**

1. Go back to your app: `http://localhost:3003/plans`
2. **Refresh the page** (Ctrl+R or F5)
3. You should now see all 4 pricing cards!

---

## 🎯 What You'll See After Fix

Once the database is populated, your PlansPage will show:

```
┌─────────────────────────────────────────┐
│         Choose Your Plan Header         │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│   [Monthly] [Yearly - Save 20%]        │
└─────────────────────────────────────────┘
┌──────┬──────┬──────┬──────────┐
│ Free │Basic│ Pro  │Enterprise│
│  ₹0  │ ₹999│₹2,499│  ₹6,999  │
│      │     │⭐Most│          │
│      │     │Popular│         │
│ 50   │ 200 │ 1000 │Unlimited │
│members│members│members│members│
│      │     │      │          │
│ 2    │  5  │  20  │Unlimited │
│trainers│trainers│trainers│trainers│
│      │     │      │          │
│ 1    │  1  │  3   │Unlimited │
│ gym  │ gym │ gyms │  gyms    │
└──────┴──────┴──────┴──────────┘
```

---

## 🔍 Troubleshooting

### **Issue: "relation 'saas_plans' does not exist"**
**Solution:** The table hasn't been created. Run the SQL from Step 2.

### **Issue: "permission denied for table saas_plans"**
**Solution:** Make sure you're logged in to Supabase and have admin access.

### **Issue: Plans still not showing**
**Solution:** 
1. Check browser console (F12) for errors
2. Verify your `.env` file has correct Supabase credentials
3. Make sure RLS policy allows authenticated users to view plans

### **Issue: "duplicate key value violates unique constraint"**
**Solution:** Plans already exist. Just run the verification query:
```sql
SELECT * FROM saas_plans;
```

---

## 📝 Quick Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Ran the CREATE TABLE query
- [ ] Ran the INSERT query
- [ ] Verified 4 plans exist
- [ ] Refreshed browser
- [ ] Plans now visible!

---

## 🎯 Alternative: Use Full Migration File

If you want to set up everything at once, run the complete migration:

**File:** `phase1_saas_schema_india.sql`

1. Open the file in your project
2. Copy ALL the contents
3. Paste into Supabase SQL Editor
4. Run the query

This will create:
- ✅ `saas_plans` table with 4 plans
- ✅ `gym_subscriptions` table
- ✅ `subscription_payments` table
- ✅ All RLS policies
- ✅ All triggers
- ✅ Default subscriptions for existing gyms

---

## 🚀 After Fix

Once you've run the SQL:

1. **Refresh browser** at `http://localhost:3003/plans`
2. **You'll see** all 4 pricing cards
3. **Test the toggle** between Monthly/Yearly
4. **Hover over cards** to see animations
5. **Enjoy your premium pricing page!** 🎉

---

**Need help?** Check the browser console (F12) for any error messages and let me know!
