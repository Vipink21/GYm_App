# ✅ Subscription Plans Configuration

## Current Setup

The **gym registration page** already displays subscription plans from the **Super Admin panel**. Here's how it works:

### Plan Source: `saas_plans` Table

The registration page fetches plans using:
```typescript
const { data } = await supabase
    .from('saas_plans')
    .select('*')
    .eq('is_active', true)      // Only active plans
    .order('price_monthly')      // Ordered by price
```

### Plan Management

**Super Admin** can manage plans via:
- **Location**: Super Admin Dashboard → Plan Management
- **Actions**: Create, Edit, Delete, Activate/Deactivate plans

### Plan Display on Registration

**Only active plans** (`is_active = true`) are shown to users during registration.

## How to Add/Edit Plans

### 1. Access Plan Management
- Login as Super Admin
- Navigate to **Plan Management** page
- View all existing plans

### 2. Create New Plan
Click **"Add New Plan"** button and fill in:
- **Name**: e.g., "Starter", "Pro", "Enterprise"
- **Description**: Plan details
- **Price (Monthly)**: ₹999, ₹2999, etc.
- **Price (Yearly)**: ₹9999, ₹29999, etc.
- **Max Gyms**: Number of gym locations allowed
- **Max Members per Gym**: Member limit (null = unlimited)
- **Max Trainers per Gym**: Trainer limit (null = unlimited)
- **Features**: List of features (JSON array)
- **Active**: Toggle to show/hide on registration

### 3. Edit Existing Plan
- Click **Edit** button on any plan
- Update details
- Save changes

### 4. Activate/Deactivate Plan
- Toggle **Active** status
- **Active plans**: Shown on registration page
- **Inactive plans**: Hidden from registration

### 5. Delete Plan
- Click **Delete** button
- Confirm deletion
- ⚠️ **Warning**: Only delete if no gyms are using this plan

## Plan Structure

### Database Schema (`saas_plans`)
```sql
{
  id: uuid,
  name: string,                    -- "Starter", "Pro", etc.
  description: string,             -- Plan description
  price_monthly: number,           -- Monthly price in INR
  price_yearly: number,            -- Yearly price in INR
  max_gyms: number,                -- Gym locations limit
  max_members_per_gym: number?,    -- Member limit (null = unlimited)
  max_trainers_per_gym: number?,   -- Trainer limit (null = unlimited)
  features: string[],              -- Array of features
  is_active: boolean,              -- Show on registration?
  created_at: timestamp,
  updated_at: timestamp
}
```

### Example Plans

#### Free Plan
```json
{
  "name": "Free",
  "price_monthly": 0,
  "price_yearly": 0,
  "max_gyms": 1,
  "max_members_per_gym": 10,
  "max_trainers_per_gym": 1,
  "features": ["1 Gym Location", "10 Members", "1 Trainer", "Basic Support"],
  "is_active": true
}
```

#### Starter Plan
```json
{
  "name": "Starter",
  "price_monthly": 999,
  "price_yearly": 9999,
  "max_gyms": 1,
  "max_members_per_gym": 50,
  "max_trainers_per_gym": 3,
  "features": ["1 Gym Location", "50 Members", "3 Trainers", "Email Support"],
  "is_active": true
}
```

#### Pro Plan
```json
{
  "name": "Pro",
  "price_monthly": 2999,
  "price_yearly": 29999,
  "max_gyms": 3,
  "max_members_per_gym": 200,
  "max_trainers_per_gym": 10,
  "features": ["3 Gym Locations", "200 Members/Gym", "10 Trainers/Gym", "Priority Support"],
  "is_active": true
}
```

#### Enterprise Plan
```json
{
  "name": "Enterprise",
  "price_monthly": 9999,
  "price_yearly": 99999,
  "max_gyms": null,              // Unlimited
  "max_members_per_gym": null,   // Unlimited
  "max_trainers_per_gym": null,  // Unlimited
  "features": ["Unlimited Locations", "Unlimited Members", "Unlimited Trainers", "24/7 Support"],
  "is_active": true
}
```

## Registration Flow

### User Perspective
1. User goes to `/register`
2. Fills owner and gym details
3. Sees **all active plans** from `saas_plans` table
4. Selects a plan
5. **If paid plan**: Payment modal opens
6. **If free plan**: Registration completes immediately

### Admin Perspective
1. Create/edit plans in Plan Management
2. Set `is_active = true` for plans to show on registration
3. Set `is_active = false` to hide plans temporarily
4. Plans appear on registration page automatically

## Verification

### Check Active Plans
```sql
SELECT name, price_monthly, is_active 
FROM saas_plans 
WHERE is_active = true 
ORDER BY price_monthly;
```

### Check Inactive Plans
```sql
SELECT name, price_monthly, is_active 
FROM saas_plans 
WHERE is_active = false 
ORDER BY price_monthly;
```

### Update Plan Status
```sql
-- Activate a plan
UPDATE saas_plans 
SET is_active = true 
WHERE name = 'Starter';

-- Deactivate a plan
UPDATE saas_plans 
SET is_active = false 
WHERE name = 'Old Plan';
```

## Important Notes

1. ✅ **Registration page already uses admin-created plans**
2. ✅ **Only active plans are shown** (`is_active = true`)
3. ✅ **Plans are ordered by price** (lowest to highest)
4. ✅ **Free plans** (price = 0) skip payment
5. ✅ **Paid plans** require Razorpay payment

## Troubleshooting

### No Plans Showing on Registration
**Issue**: Registration page shows no plans

**Solutions**:
1. Check if any plans exist in `saas_plans` table
2. Verify at least one plan has `is_active = true`
3. Check browser console for errors
4. Verify Supabase connection

### Wrong Plans Showing
**Issue**: Old/incorrect plans appearing

**Solutions**:
1. Deactivate old plans: `is_active = false`
2. Activate correct plans: `is_active = true`
3. Refresh registration page

### Plan Changes Not Reflecting
**Issue**: Updated plans not showing

**Solutions**:
1. Hard refresh browser (Ctrl+F5)
2. Clear browser cache
3. Verify changes saved in database
4. Check `updated_at` timestamp

## Summary

✅ **The registration page is already correctly configured** to show plans from the Super Admin panel!

- Plans are fetched from `saas_plans` table
- Only active plans are displayed
- Super Admin can manage plans via Plan Management page
- Changes reflect immediately on registration page

No code changes needed - the system is working as expected! 🎉

---

**Last Updated**: December 2025
