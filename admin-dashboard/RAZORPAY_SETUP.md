# Razorpay Payment Setup Guide

## Quick Setup

### 1. Configure Razorpay Key (Recommended Method)
The easiest way to configure Razorpay is through the **Super Admin Dashboard**:

1. Navigate to **Super Admin Dashboard** → **Settings**
2. Find the **Razorpay Configuration** section
3. Enter your Razorpay Key ID:
   - **Test Mode**: `rzp_test_your_key_id`
   - **Live Mode**: `rzp_live_your_key_id`
4. Save settings

✅ **Advantage**: No need to redeploy the application when changing keys

### 2. Alternative: Environment Variable
You can also set the key via environment variable (lower priority):

Create `.env.local`:
```env
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### Key Priority Order
The system fetches the Razorpay key in this order:
1. **Database** (Super Admin Settings) - **Recommended** ✅
2. Environment Variable (`.env.local`)
3. Placeholder (for development only)

## How Member Registration Payment Works

### For Free Tier Plans
- No payment required
- Member is registered immediately
- Free tier plans: "Free", "Trial", "Demo", "Basic Trial", "No Plan"

### For Paid Plans
1. Admin fills member registration form
2. Clicks "Add Member"
3. **Razorpay payment modal opens automatically**
4. Member/Admin completes payment
5. On success: Member is registered + Payment recorded
6. On failure: Registration is cancelled

## Testing Payment Flow

### Step 1: Set Test Key
In Super Admin Settings, use:
```
rzp_test_your_actual_test_key
```

### Step 2: Register a Member
1. Go to **Members** page
2. Click **Add Member**
3. Fill in details:
   - Name: Test User
   - Email: test@example.com
   - Phone: +91 9876543210
   - Plan: **Gold Annual** (or any paid plan)
4. Click **Add Member**

### Step 3: Complete Test Payment
Razorpay modal will open. Use test card:
- **Card**: 4111 1111 1111 1111
- **CVV**: 123
- **Expiry**: 12/25
- **Name**: Test User

### Step 4: Verify
- Member should appear in members list
- Payment should be recorded in Payments page
- Success message should appear

## Plan Pricing

### Default Prices (INR)
- Gold Annual: ₹12,000
- Silver Monthly: ₹1,500
- Platinum: ₹20,000
- Bronze: ₹8,000
- Basic: ₹5,000
- Premium: ₹15,000
- Standard: ₹3,000

### Custom Pricing
To set custom prices:
1. Create plans in `membership_plans` table with your gym_id
2. The system will automatically use database prices
3. Falls back to default prices if not found

## Production Deployment

### 1. Get Live Razorpay Key
- Sign up at [razorpay.com](https://razorpay.com)
- Complete KYC verification
- Get live key from Dashboard → Settings → API Keys

### 2. Update Super Admin Settings
- Go to Super Admin Dashboard → Settings
- Replace test key with live key: `rzp_live_your_actual_key`
- Save

### 3. Test in Production
- Register a test member with a small amount
- Verify payment is received in Razorpay dashboard
- Verify member is created in your system

## Database Schema

### Payments Table
The following columns store Razorpay data:
- `razorpay_order_id` - Order ID from Razorpay
- `razorpay_payment_id` - Payment ID after successful payment
- `razorpay_signature` - Signature for verification
- `member_id` - Link to the registered member
- `gym_id` - Link to the gym
- `amount` - Payment amount in INR
- `status` - 'success', 'pending', or 'failed'

### Migration
Run the migration to add Razorpay columns:
```sql
-- File: migrations/add_razorpay_payment_fields.sql
-- Execute in Supabase SQL Editor
```

## Troubleshooting

### Payment Modal Doesn't Open
- ✅ Check if Razorpay key is set in Super Admin Settings
- ✅ Check browser console for errors
- ✅ Verify Razorpay script is loaded in `index.html`

### Payment Succeeds but Member Not Created
- ✅ Check browser console for errors
- ✅ Verify `members` table permissions in Supabase
- ✅ Check if gym has reached member limit

### Wrong Amount Displayed
- ✅ Update plan prices in `membership_plans` table
- ✅ Or update default prices in `razorpayService.ts`

## Security Notes

⚠️ **Important**:
- Never expose Razorpay **secret key** in frontend
- Only use **key_id** (starts with `rzp_test_` or `rzp_live_`)
- Secret key should only be used in backend/server
- For production, implement backend payment verification

## Support

For Razorpay-related issues:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Support](https://razorpay.com/support/)

For integration issues:
- Check `PAYMENT_INTEGRATION.md` for detailed documentation
- Review browser console logs
- Check Supabase logs

---

**Quick Start**: Just add your Razorpay key in Super Admin Settings and you're ready to accept payments! 🚀
