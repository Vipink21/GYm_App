# 🔧 Razorpay Registration Payment Fix

## Problem Identified

When a gym owner registers and selects a paid plan, the Razorpay payment modal **doesn't open** or shows an error. This happens because:

1. **RLS Policy Issue**: The registration page runs **before authentication**, so unauthenticated users cannot fetch the Razorpay key from the `system_settings` table
2. **Missing Environment Variable**: The `.env` file might not have the Razorpay key configured as a fallback

## Solution: Two-Part Fix

### Part 1: Fix RLS Policy (Recommended)

This allows the registration page to fetch the Razorpay key from the database.

**Run this SQL in Supabase SQL Editor:**

```sql
-- FIX: Allow Registration Page to Access Razorpay Key
-- This fixes the RLS policy so unauthenticated users can fetch the Razorpay key during registration

-- Step 1: Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow read access to settings" ON system_settings;
DROP POLICY IF EXISTS "Allow public read of razorpay key" ON system_settings;

-- Step 2: Create policy to allow public read of Razorpay key ONLY
-- This is safe because:
-- 1. Only the Key ID is exposed (not the secret)
-- 2. Key ID is meant to be public (used in frontend)
-- 3. Only the razorpay_key_id field is accessible, not other settings
CREATE POLICY "Allow public read of razorpay key"
ON system_settings
FOR SELECT
USING (key = 'razorpay_key_id');

-- Step 3: Keep super admin full access
CREATE POLICY "Allow super admin full access to settings"
ON system_settings
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'superadmin'
    )
);

-- Step 4: Verify the key exists and is accessible
SELECT 
    key,
    LEFT(value, 20) || '...' as key_preview,
    CASE 
        WHEN value LIKE 'rzp_test_%' THEN '✅ Valid Test Key'
        WHEN value LIKE 'rzp_live_%' THEN '✅ Valid Live Key'
        WHEN value = '' THEN '⚠️ Empty - Please add key in Super Admin Settings'
        ELSE '❌ Invalid Format'
    END as status
FROM system_settings 
WHERE key = 'razorpay_key_id';
```

### Part 2: Add Environment Variable Fallback

Create a `.env` file in the `admin-dashboard` folder:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Razorpay Configuration (Fallback if database key is not accessible)
VITE_RAZORPAY_KEY_ID=rzp_test_RtquCrC1XAr1cZ
```

**Important**: Replace `rzp_test_RtquCrC1XAr1cZ` with your actual Razorpay key from the System Settings page.

## Step-by-Step Fix Instructions

### Step 1: Run the SQL Fix
1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Copy the SQL from **Part 1** above
4. Click **Run**
5. Verify you see "✅ Valid Test Key" in the output

### Step 2: Create .env File
1. In `f:\GYM Project\admin-dashboard\`, create a file named `.env`
2. Copy the content from `.env.example`
3. Add your Razorpay key from the System Settings page (the one shown in your screenshot: `rzp_test_RtquCrC1XAr1cZ`)

### Step 3: Restart the Development Server
1. Stop the current server (Ctrl+C in terminal)
2. Run `npm run dev` again
3. The server will now load the environment variables

### Step 4: Test the Registration Flow
1. Go to `http://localhost:3000/register`
2. Fill in owner details (Step 1)
3. Fill in gym details (Step 2)
4. Select a **paid plan** (Step 3)
5. The Razorpay payment modal should now open
6. Use test card: `4111 1111 1111 1111`, CVV: `123`, Expiry: any future date

## Why This Happens

### The Registration Flow:
```
User visits /register → Fills form → Selects plan → 
  ↓
Payment needed? → YES → Fetch Razorpay key →
  ↓
Problem: User is NOT authenticated yet!
  ↓
RLS blocks access to system_settings table
  ↓
Razorpay key fetch fails → Falls back to env variable
  ↓
If env variable missing → Uses placeholder → Payment fails
```

### The Fix:
```
Solution 1 (RLS): Allow public read of razorpay_key_id ONLY
  ↓
Safe because: Key ID is meant to be public (like Stripe publishable key)
  ↓
Registration page can now fetch key from database

Solution 2 (ENV): Add key to .env as fallback
  ↓
If database fails, use environment variable
  ↓
Ensures payment always works
```

## Security Considerations

### Is it safe to expose the Razorpay Key ID?

**YES!** This is completely safe because:

1. **Key ID vs Key Secret**: 
   - **Key ID** (`rzp_test_xxx`): Public, meant to be used in frontend
   - **Key Secret**: Private, never exposed to frontend

2. **Industry Standard**:
   - Stripe uses "Publishable Key" (public)
   - PayPal uses "Client ID" (public)
   - Razorpay uses "Key ID" (public)

3. **What's Protected**:
   - The Key Secret remains in your backend/Supabase
   - Payment verification happens server-side
   - Users can't create fake payments

4. **RLS Policy is Specific**:
   - Only `razorpay_key_id` is readable by public
   - Other settings remain protected
   - Super admin still has full access

## Verification Checklist

After applying the fix, verify:

- [ ] SQL executed successfully in Supabase
- [ ] `.env` file created with correct Razorpay key
- [ ] Development server restarted
- [ ] Registration page loads without errors
- [ ] Browser console shows: `"Using database key"` or `"Falling back to env key"`
- [ ] Razorpay payment modal opens when selecting paid plan
- [ ] Test payment completes successfully

## Troubleshooting

### Issue: "Razorpay key not configured"
**Solution**: 
- Check if key exists in `system_settings` table
- Verify `.env` file has `VITE_RAZORPAY_KEY_ID`
- Restart dev server

### Issue: "Razorpay SDK not loaded"
**Solution**:
- Hard refresh: `Ctrl + F5`
- Check `index.html` has Razorpay script
- Clear browser cache

### Issue: Payment modal opens but fails
**Solution**:
- Verify key is valid (starts with `rzp_test_` or `rzp_live_`)
- Check browser console for specific error
- Ensure you're using test card: `4111 1111 1111 1111`

### Issue: "Payment cancelled by user"
**Solution**:
- This is normal - user closed the modal
- Try again and complete the payment

## Testing the Fix

### Console Logs to Check:
Open browser console (F12) and look for:

```
✅ Good:
"Fetching Razorpay key..."
"Database key result: rzp_test_Rtqu..."
"Using database key"
"Razorpay key loaded: rzp_test_Rtqu..."

❌ Bad:
"Failed to fetch Razorpay key from DB: [error]"
"Falling back to env key: rzp_test_placeh..."
"Razorpay key not configured"
```

## Quick Reference

### Get Your Razorpay Key:
1. Go to System Settings in your admin dashboard
2. Look for "Razorpay Integration" section
3. Copy the "RAZORPAY KEY ID" value
4. It should look like: `rzp_test_RtquCrC1XAr1cZ`

### Where to Add the Key:
1. **Database** (Primary): Already done via System Settings
2. **Environment** (Fallback): Add to `.env` file

---

**Status**: Fix Ready ✅  
**Action Required**: Run SQL + Create .env file  
**Estimated Time**: 5 minutes  
**Last Updated**: December 22, 2025
