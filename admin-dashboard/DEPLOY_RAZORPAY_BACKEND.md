# 🚀 Deploy Razorpay Backend - Step by Step Guide

## What We're Doing

We're deploying a **Supabase Edge Function** that will:
1. Securely create real Razorpay orders using your **Key Secret**
2. Return valid order IDs to the frontend
3. Enable paid plan registration to work properly

---

## Prerequisites

✅ You have both Razorpay keys:
- **Key ID**: `rzp_test_RtquCrCtXArTcZ` (already in `.env`)
- **Key Secret**: `cHSIrcHUJtURDjX5PAqeFQji` (will be stored in Supabase)

---

## Step 1: Install Supabase CLI

Open PowerShell and run:

```powershell
# Install Supabase CLI
npm install -g supabase

# Verify installation
supabase --version
```

---

## Step 2: Login to Supabase

```powershell
# Login to your Supabase account
supabase login
```

This will open a browser window. Login with your Supabase credentials.

---

## Step 3: Link Your Project

```powershell
# Navigate to your project
cd "f:\GYM Project\admin-dashboard"

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF
```

**How to find YOUR_PROJECT_REF:**
1. Go to Supabase Dashboard
2. Look at the URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
3. Copy the project ref (it's a random string like `abcdefghijklmnop`)

---

## Step 4: Set the Razorpay Key Secret

```powershell
# Set the secret (this is stored securely in Supabase)
supabase secrets set RAZORPAY_KEY_SECRET=cHSIrcHUJtURDjX5PAqeFQji
```

**Important:** This command stores the secret securely on Supabase servers. It will NEVER be visible in your code or frontend.

---

## Step 5: Deploy the Edge Function

```powershell
# Deploy the create-razorpay-order function
supabase functions deploy create-razorpay-order
```

You should see output like:
```
✓ Deployed Function create-razorpay-order
Function URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-razorpay-order
```

---

## Step 6: Verify Deployment

Test the function:

```powershell
# Test the function
supabase functions invoke create-razorpay-order --body '{"amount": 10, "currency": "INR"}'
```

You should see a response with a real Razorpay order ID:
```json
{
  "id": "order_XXXXXXXXXX",
  "amount": 1000,
  "currency": "INR",
  ...
}
```

---

## Step 7: Restart Dev Server

The frontend code has been updated. Restart your dev server:

```powershell
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## Step 8: Test Registration

1. Go to `http://localhost:3000/register`
2. Fill in all details (Steps 1 & 2)
3. Select a **paid plan** (not Free)
4. The Razorpay payment modal should now open successfully! 🎉
5. Use test card: `4111 1111 1111 1111`, CVV: `123`, Expiry: `12/25`

---

## Troubleshooting

### Issue: "supabase: command not found"

**Solution:**
```powershell
# Reinstall globally
npm install -g supabase --force

# Or use npx
npx supabase login
```

### Issue: "Project not linked"

**Solution:**
```powershell
# Make sure you're in the right directory
cd "f:\GYM Project\admin-dashboard"

# Link again with correct project ref
supabase link --project-ref YOUR_PROJECT_REF
```

### Issue: "Failed to create order" in browser console

**Solution:**
1. Check if the function is deployed:
   ```powershell
   supabase functions list
   ```
2. Check function logs:
   ```powershell
   supabase functions logs create-razorpay-order
   ```
3. Verify the secret is set:
   ```powershell
   supabase secrets list
   ```

### Issue: "CORS error" in browser

**Solution:** The function already has CORS headers. If you still see CORS errors:
1. Make sure you're calling from `localhost:3000`
2. Check Supabase dashboard → Edge Functions → Settings → CORS

---

## Alternative: Manual Deployment via Supabase Dashboard

If CLI doesn't work, you can deploy manually:

1. **Go to Supabase Dashboard** → **Edge Functions**
2. **Click "Create Function"**
3. **Name**: `create-razorpay-order`
4. **Copy the code** from `supabase/functions/create-razorpay-order/index.ts`
5. **Paste** into the editor
6. **Click "Deploy"**
7. **Go to Settings** → **Secrets**
8. **Add secret**: `RAZORPAY_KEY_SECRET` = `cHSIrcHUJtURDjX5PAqeFQji`

---

## Verification Checklist

After deployment, verify:

- [ ] Supabase CLI installed
- [ ] Logged in to Supabase
- [ ] Project linked
- [ ] Secret `RAZORPAY_KEY_SECRET` set
- [ ] Function `create-razorpay-order` deployed
- [ ] Function test returns real order ID
- [ ] Dev server restarted
- [ ] Registration page loads without errors
- [ ] Paid plan opens Razorpay modal
- [ ] Test payment completes successfully

---

## Security Notes

✅ **What's Safe:**
- Key ID in `.env` file (public key)
- Key ID in System Settings (public key)
- Edge Function code (no secrets hardcoded)

🔒 **What's Protected:**
- Key Secret stored in Supabase Secrets (encrypted)
- Key Secret never exposed to frontend
- Orders created server-side only

❌ **Never Do This:**
- Don't add Key Secret to `.env`
- Don't commit Key Secret to git
- Don't expose Key Secret in frontend code

---

## Next Steps After Deployment

1. **Test thoroughly** with test card
2. **Check payment records** in Supabase `payments` table
3. **Monitor function logs** for any errors
4. **Switch to live keys** when ready for production:
   - Update Key ID in System Settings
   - Update Key Secret in Supabase Secrets
   - Test with real card (small amount)

---

## Quick Commands Reference

```powershell
# Install CLI
npm install -g supabase

# Login
supabase login

# Link project
cd "f:\GYM Project\admin-dashboard"
supabase link --project-ref YOUR_PROJECT_REF

# Set secret
supabase secrets set RAZORPAY_KEY_SECRET=cHSIrcHUJtURDjX5PAqeFQji

# Deploy function
supabase functions deploy create-razorpay-order

# Test function
supabase functions invoke create-razorpay-order --body '{"amount": 10}'

# View logs
supabase functions logs create-razorpay-order

# List functions
supabase functions list

# List secrets
supabase secrets list
```

---

**Estimated Time:** 10-15 minutes  
**Difficulty:** Easy (just follow the steps)  
**Status:** Ready to deploy! 🚀

---

**Need Help?** If you encounter any issues, share the error message and I'll help you fix it!
