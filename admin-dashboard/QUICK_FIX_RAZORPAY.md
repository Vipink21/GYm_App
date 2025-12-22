# 🚀 Quick Fix for Razorpay Registration Payment

## Problem
When registering as a GYM owner and selecting a paid plan, the Razorpay payment doesn't work.

## Root Cause
The registration page runs **before authentication**, so it cannot fetch the Razorpay key from the database due to Row Level Security (RLS) policies.

## ✅ Solution (Choose ONE)

### Option 1: Fix Database RLS Policy (Recommended)

**This allows the registration page to fetch the key from the database.**

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Click on "SQL Editor" in the left sidebar

2. **Run the Fix Script**
   - Open the file: `migrations/fix_registration_razorpay.sql`
   - Copy the entire content
   - Paste into Supabase SQL Editor
   - Click **"Run"**

3. **Verify Success**
   - You should see: `✅ Valid Test Key` in the output
   - If you see `⚠️ Empty`, go to System Settings and add your Razorpay key first

4. **Restart Dev Server**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

5. **Test Registration**
   - Go to `http://localhost:3000/register`
   - Fill in all details
   - Select a **paid plan**
   - Payment modal should now open! 🎉

---

### Option 2: Add Environment Variable (Quick Fallback)

**If you can't access Supabase, use this temporary fix.**

1. **Create `.env` file** in `admin-dashboard` folder:
   ```env
   # Copy your existing Supabase credentials
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   
   # Add Razorpay key (from your System Settings screenshot)
   VITE_RAZORPAY_KEY_ID=rzp_test_RtquCrC1XAr1cZ
   ```

2. **Restart Dev Server**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

3. **Test Registration**
   - Payment should now work!

---

## 🧪 Testing the Fix

### Test Card Details (Razorpay Test Mode):
- **Card Number**: `4111 1111 1111 1111`
- **CVV**: `123` (any 3 digits)
- **Expiry**: `12/25` (any future date)
- **Name**: Any name

### What to Check:
1. Open browser console (F12)
2. Look for these logs:
   ```
   ✅ "Fetching Razorpay key..."
   ✅ "Using database key" (if Option 1 worked)
   ✅ "Razorpay key loaded: rzp_test_Rtqu..."
   ```

3. Payment modal should open when you select a paid plan
4. After successful payment, you should be redirected to login

---

## 🔍 Troubleshooting

### Issue: "Razorpay key not configured"
**Fix**: 
- Make sure you ran the SQL script in Supabase
- OR created the `.env` file with the correct key
- Restart dev server

### Issue: "Razorpay SDK not loaded"
**Fix**:
- Hard refresh: `Ctrl + F5`
- Clear browser cache
- Check if `index.html` has the Razorpay script (it should)

### Issue: Payment modal opens but payment fails
**Fix**:
- Use test card: `4111 1111 1111 1111`
- Make sure you're using the correct Razorpay key
- Check browser console for specific errors

### Issue: Still not working?
**Debug Steps**:
1. Open browser console (F12)
2. Go to registration page
3. Open console and type:
   ```javascript
   console.log(window.Razorpay ? 'Razorpay loaded ✅' : 'Razorpay NOT loaded ❌')
   ```
4. Take a screenshot of any errors and share them

---

## 📋 Summary

**What we're fixing:**
- Registration page can't access Razorpay key from database
- RLS policy blocks unauthenticated users

**How we're fixing it:**
- **Option 1**: Update RLS policy to allow public read of Razorpay key ONLY
- **Option 2**: Add key to environment variable as fallback

**Why it's safe:**
- Razorpay Key ID is meant to be public (like Stripe publishable key)
- The Key Secret remains protected
- This is industry standard practice

---

## ⏱️ Estimated Time
- **Option 1**: 3-5 minutes
- **Option 2**: 1-2 minutes

## 📚 Related Files
- Fix Script: `migrations/fix_registration_razorpay.sql`
- Detailed Guide: `RAZORPAY_REGISTRATION_FIX.md`
- Service Code: `src/services/razorpayService.ts`

---

**Need Help?** Check the browser console (F12) for error messages and refer to the detailed guide in `RAZORPAY_REGISTRATION_FIX.md`.
