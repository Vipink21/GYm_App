# Gym Registration Payment Flow - Complete Guide

## 🎯 Overview

The system now requires **payment for gym subscription** during registration for all non-free plans. This ensures gyms are properly subscribed before they can access the platform.

## 🔄 Registration Flow

### Step 1: Owner Details
- Full Name
- Email
- Phone Number
- Address & City
- Password

### Step 2: Gym Information
- Gym Name
- Gym Type (Unisex/Male/Female)
- Location & City
- Contact Number

### Step 3: Plan Selection & Payment

#### For Free Plans (₹0/month):
1. User selects free plan
2. ✅ Registration completes immediately
3. No payment required
4. Gym is created with free subscription

#### For Paid Plans:
1. User selects paid plan (e.g., Starter, Pro, Enterprise)
2. 💳 **Razorpay payment modal opens automatically**
3. User completes payment
4. On payment success:
   - User account is created
   - Gym is created
   - Subscription is activated
   - Payment is recorded
   - User is redirected to login
5. On payment failure/cancellation:
   - Registration is cancelled
   - No account or gym is created
   - User can try again

## 💰 Payment Integration Details

### Free Tier Detection
Plans are considered free if:
- `price_monthly === 0`
- Plan name contains: "free", "trial", "demo", "basic trial"

### Payment Processing
```typescript
// Payment flow for paid plans
1. User clicks on paid plan
2. Razorpay modal opens with plan details
3. User enters payment information
4. Payment is processed by Razorpay
5. On success:
   - completeRegistration() is called
   - User signup → Profile update → Gym creation → Payment recording
6. On failure:
   - Error message shown
   - Registration cancelled
```

### Payment Recording
All successful payments are stored in `payments` table:
```sql
{
  gym_id: created_gym_id,
  amount: plan_price_monthly,
  currency: 'INR',
  payment_method: 'razorpay',
  razorpay_order_id: 'order_xxx',
  razorpay_payment_id: 'pay_xxx',
  razorpay_signature: 'signature_xxx',
  status: 'success',
  description: 'Plan Name - Owner Name',
  transaction_date: timestamp
}
```

## ⚙️ Configuration

### 1. Razorpay Key Setup
**Recommended**: Configure via Super Admin Dashboard
- Navigate to: Super Admin → Settings
- Add Razorpay Key ID
- Test: `rzp_test_your_key`
- Live: `rzp_live_your_key`

### 2. Plan Configuration
Plans are fetched from `saas_plans` table:
```sql
SELECT * FROM saas_plans 
WHERE is_active = true 
ORDER BY price_monthly
```

## 🧪 Testing

### Test Gym Registration with Payment

1. **Navigate to Registration**
   - Go to `/register`
   - Or click "Sign up" from login page

2. **Fill Owner Details** (Step 1)
   - Name: Test Owner
   - Email: test@example.com
   - Phone: +91 9876543210
   - Address: Test Address
   - City: Mumbai
   - Password: Test@123

3. **Fill Gym Details** (Step 2)
   - Gym Name: Test Fitness Center
   - Type: Unisex
   - Location: Sector 18, Main Road
   - City: Mumbai
   - Contact: +91 9876543210

4. **Select Paid Plan** (Step 3)
   - Click on any paid plan (e.g., "Starter - ₹999/mo")
   - **Razorpay modal opens automatically**

5. **Complete Test Payment**
   - Use test card: `4111 1111 1111 1111`
   - CVV: `123`
   - Expiry: `12/25`
   - Name: `Test User`
   - Click "Pay ₹999"

6. **Verify Success**
   - Success message appears
   - Redirected to login page
   - Can now login with credentials

### Test Free Plan Registration

1. Follow steps 1-3 above
2. Select **Free Plan** (₹0/month)
3. Registration completes immediately
4. No payment modal appears
5. Redirected to login

## 🔍 Verification

### Check Payment in Database
```sql
SELECT * FROM payments 
WHERE payment_method = 'razorpay' 
ORDER BY transaction_date DESC;
```

### Check Gym Subscription
```sql
SELECT g.name, s.status, s.billing_cycle, p.name as plan_name
FROM gyms g
JOIN gym_subscriptions s ON s.gym_id = g.id
JOIN saas_plans p ON p.id = s.plan_id
WHERE g.owner_id = 'user_id';
```

## 🚀 Production Deployment

### 1. Update Razorpay Key
- Get live key from Razorpay dashboard
- Update in Super Admin Settings
- Replace `rzp_test_` with `rzp_live_`

### 2. Test with Real Payment
- Register a test gym with small amount
- Verify payment in Razorpay dashboard
- Verify gym creation and subscription

### 3. Monitor Payments
- Check Razorpay dashboard for all transactions
- Verify payments table for records
- Monitor for failed payments

## 🛠️ Troubleshooting

### Payment Modal Doesn't Open
**Issue**: Clicking paid plan doesn't show payment modal

**Solutions**:
1. ✅ Check browser console for errors
2. ✅ Verify Razorpay key in Super Admin Settings
3. ✅ Ensure Razorpay script loaded in `index.html`
4. ✅ Check if plan price > 0

### Payment Succeeds but Gym Not Created
**Issue**: Payment completed but registration failed

**Solutions**:
1. ✅ Check browser console for errors
2. ✅ Verify `create_new_gym` RPC function exists
3. ✅ Check Supabase logs for errors
4. ✅ Verify user has proper permissions
5. ⚠️ **Important**: Payment is recorded, contact support with payment ID

### Wrong Amount Charged
**Issue**: Different amount than plan price

**Solutions**:
1. ✅ Verify plan prices in `saas_plans` table
2. ✅ Check `price_monthly` field
3. ✅ Ensure no currency conversion issues

### Free Plan Asks for Payment
**Issue**: Free plan showing payment modal

**Solutions**:
1. ✅ Verify plan `price_monthly` is `0`
2. ✅ Check plan name doesn't contain paid keywords
3. ✅ Update `isFreeTier()` logic if needed

## 📊 Payment Flow Diagram

```
User Selects Plan
       ↓
   Is Free Plan?
    ↙        ↘
  Yes         No
   ↓           ↓
Register   Open Payment
Immediately    Modal
   ↓           ↓
Success    Payment?
           ↙      ↘
        Success  Failed
          ↓        ↓
       Register  Cancel
          ↓
       Success
```

## 🔐 Security Best Practices

1. **Never expose secret key** in frontend
2. **Verify payments** server-side (recommended)
3. **Use HTTPS** in production
4. **Validate amounts** before processing
5. **Log all transactions** for audit trail
6. **Handle failures gracefully**
7. **Provide clear error messages**

## 📝 Code Changes Summary

### Files Modified:
1. **`src/pages/RegisterPage.tsx`**
   - Added `razorpayService` import
   - Updated `handleRegister()` to check plan type
   - Added `completeRegistration()` helper function
   - Integrated payment flow for paid plans
   - Added payment recording after gym creation

2. **`src/services/razorpayService.ts`**
   - Already has `openMembershipCheckout()`
   - Already has `recordMembershipPayment()`
   - Already has `isFreeTier()` detection

### Database:
- Uses existing `payments` table
- Uses existing `gym_subscriptions` table
- No schema changes required

## 🎉 Benefits

1. **Revenue Collection**: Automatic payment collection during signup
2. **No Unpaid Gyms**: Only paid gyms get access
3. **Audit Trail**: All payments recorded
4. **User Experience**: Seamless payment integration
5. **Flexibility**: Free plans still work without payment

## 📞 Support

### For Payment Issues:
- Razorpay Dashboard: https://dashboard.razorpay.com
- Razorpay Support: https://razorpay.com/support/

### For Integration Issues:
- Check browser console logs
- Review Supabase logs
- Verify Razorpay key configuration
- Test with Razorpay test mode first

---

**Status**: ✅ Fully Implemented
**Last Updated**: December 2025
**Version**: 2.0.0
