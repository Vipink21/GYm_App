# Member Registration Payment Integration

## Overview
This document explains the Razorpay payment integration for gym member registration. When registering a new member with a non-free tier plan, payment must be completed before the registration is finalized.

## How It Works

### 1. **Payment Flow**
```
User fills registration form → Checks if plan is free tier → 
  ├─ Free Tier: Register member immediately
  └─ Paid Tier: Open Razorpay payment modal →
      ├─ Payment Success: Create member + Record payment
      └─ Payment Failed/Cancelled: Cancel registration
```

### 2. **Free Tier Detection**
The following plans are considered free tier (no payment required):
- Plans containing "free" (case-insensitive)
- Plans containing "trial"
- Plans containing "demo"
- Plans containing "basic trial"
- Plans named "No Plan"

### 3. **Plan Pricing**
Plan prices are fetched in the following order:
1. **Database**: Checks `membership_plans` table for the specific gym
2. **Fallback**: Uses default prices if not found in database:
   - Gold Annual: ₹12,000
   - Silver Monthly: ₹1,500
   - Platinum: ₹20,000
   - Bronze: ₹8,000
   - Basic: ₹5,000
   - Premium: ₹15,000
   - Standard: ₹3,000
   - Default: ₹1,000

## Configuration

### 1. **Environment Variables**
Create a `.env.local` file (copy from `.env.example`):

```env
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id  # For testing
# VITE_RAZORPAY_KEY_ID=rzp_live_your_key_id  # For production
```

### 2. **Database Configuration**
You can also store the Razorpay key in the database via the Settings page. The system will use the database key if available, otherwise falls back to environment variable.

## Payment Recording

### Database Schema
Payments are recorded in the `payments` table with the following fields:
- `gym_id`: The gym the member belongs to
- `member_id`: The registered member's ID (updated after member creation)
- `amount`: Payment amount in INR
- `currency`: Always 'INR'
- `payment_method`: Always 'razorpay'
- `razorpay_order_id`: Razorpay order ID
- `razorpay_payment_id`: Razorpay payment ID
- `razorpay_signature`: Payment signature for verification
- `status`: 'success', 'pending', or 'failed'
- `description`: Plan name and member name
- `transaction_date`: Timestamp of the transaction

## Testing

### Test Mode
1. Use Razorpay test key: `rzp_test_...`
2. Use test card details:
   - **Card Number**: 4111 1111 1111 1111
   - **CVV**: Any 3 digits
   - **Expiry**: Any future date
   - **Name**: Any name

### Test Scenarios
1. **Successful Payment**: Complete payment with test card
2. **Failed Payment**: Close payment modal without completing
3. **Free Tier**: Select a free plan and verify no payment is requested

## Production Deployment

### 1. **Get Razorpay Credentials**
- Sign up at [https://razorpay.com](https://razorpay.com)
- Complete KYC verification
- Get your live API keys from Dashboard → Settings → API Keys

### 2. **Update Environment**
```env
VITE_RAZORPAY_KEY_ID=rzp_live_your_actual_key_id
```

### 3. **Backend Integration (Recommended)**
For production, implement backend order creation and payment verification:

#### Create Order Endpoint
```typescript
// Supabase Edge Function: create-razorpay-order
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: 'YOUR_KEY_ID',
  key_secret: 'YOUR_KEY_SECRET'
})

export async function handler(req: Request) {
  const { amount, currency, receipt, notes } = await req.json()
  
  const order = await razorpay.orders.create({
    amount,
    currency,
    receipt,
    notes
  })
  
  return new Response(JSON.stringify(order), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

#### Verify Payment Endpoint
```typescript
// Supabase Edge Function: verify-razorpay-payment
import crypto from 'crypto'

export async function handler(req: Request) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()
  
  const body = razorpay_order_id + '|' + razorpay_payment_id
  const expectedSignature = crypto
    .createHmac('sha256', 'YOUR_KEY_SECRET')
    .update(body)
    .digest('hex')
  
  const verified = expectedSignature === razorpay_signature
  
  return new Response(JSON.stringify({ verified }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

## Code Structure

### Files Modified/Created
1. **`src/services/razorpayService.ts`** - Core payment service
   - `openMembershipCheckout()` - Opens payment modal
   - `recordMembershipPayment()` - Records payment in database
   - `getMembershipPlanPrice()` - Fetches plan pricing
   - `isFreeTier()` - Checks if plan is free

2. **`src/pages/MembersPage.tsx`** - Member registration page
   - Updated `handleAddMember()` to integrate payment flow
   - Added payment-first registration logic

3. **`index.html`** - Razorpay script already loaded

## User Experience

### For Gym Admins
1. Click "Add Member" button
2. Fill in member details (name, email, phone, plan, trainer)
3. Click "Add Member"
4. **If paid plan**: Razorpay payment modal opens
   - Enter payment details
   - Complete payment
   - Member is registered automatically
5. **If free plan**: Member is registered immediately

### Error Handling
- **Payment Failed**: Shows error message, registration cancelled
- **Payment Cancelled**: Silent cancellation, modal closes
- **Network Error**: Shows error message with details
- **Member Creation Failed After Payment**: Shows error, advises to contact support

## Security Considerations

1. **Never expose secret key**: Only use `key_id` in frontend
2. **Verify payments server-side**: Implement backend verification
3. **Use HTTPS**: Always use HTTPS in production
4. **Validate amounts**: Verify payment amount matches plan price
5. **Audit trail**: All payments are logged in database

## Support & Troubleshooting

### Common Issues

**Issue**: Payment modal doesn't open
- **Solution**: Check if Razorpay script is loaded in `index.html`
- **Solution**: Verify `VITE_RAZORPAY_KEY_ID` is set correctly

**Issue**: Payment succeeds but member not created
- **Solution**: Check browser console for errors
- **Solution**: Verify Supabase permissions for `members` table
- **Solution**: Contact support with payment ID

**Issue**: Wrong plan price displayed
- **Solution**: Update plan prices in `membership_plans` table
- **Solution**: Update default prices in `razorpayService.ts`

### Getting Help
- Check browser console for detailed error messages
- Review payment records in `payments` table
- Contact Razorpay support for payment-related issues
- Check Supabase logs for database errors

## Future Enhancements

1. **Webhooks**: Implement Razorpay webhooks for payment status updates
2. **Refunds**: Add refund functionality for cancelled memberships
3. **Subscriptions**: Implement recurring payments for auto-renewal
4. **Multiple Payment Methods**: Add UPI, Net Banking, Wallets
5. **Payment Plans**: Support installment payments
6. **Discounts**: Apply coupon codes during payment

## Compliance

- **PCI DSS**: Razorpay is PCI DSS compliant
- **Data Privacy**: No card details are stored in your database
- **Indian Regulations**: Compliant with RBI guidelines
- **GST**: Add GST calculation if required

---

**Last Updated**: December 2025
**Version**: 1.0.0
