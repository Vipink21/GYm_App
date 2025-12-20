# Dynamic Plan Display - Implementation Guide

**Date**: December 20, 2025  
**Feature**: Dynamic SaaS Plan Display for Gym Owners

---

## 🎯 Overview

The Super Admin Dashboard now displays **dynamic, real-time subscription plan data** for each gym partner. The plan badges automatically update based on the gym's active subscription and use color-coded styling to differentiate plan tiers.

---

## 📊 What Changed

### **1. Enhanced Data Fetching** (`adminService.ts`)

**Before**:
```typescript
subscription:gym_subscriptions (
    status,
    plan:saas_plans (name)
)
```

**After**:
```typescript
subscription:gym_subscriptions (
    status,
    plan:saas_plans (
        name,
        id
    )
)
```

**Plus Active Filtering**:
```typescript
// Filter to show only active subscriptions for each gym
const gymsWithActiveSubs = (data || []).map(gym => ({
    ...gym,
    subscription: gym.subscription?.filter((sub: any) => sub.status === 'active') || []
}))
```

**Benefits**:
- ✅ Fetches complete plan details (name + ID)
- ✅ Filters out inactive/expired subscriptions
- ✅ Prevents dashboard crashes on query errors
- ✅ Shows only current, active plans

---

### **2. Dynamic Plan Badge Styling** (`Dashboard.tsx`)

Added intelligent color-coding based on plan tier:

```typescript
const getPlanBadgeStyle = (planName: string) => {
    const name = planName?.toLowerCase() || 'free'
    
    if (name.includes('enterprise') || name.includes('premium')) {
        return {
            background: '#f3e8ff',  // Purple
            color: '#7c3aed',
            border: '1px solid #c4b5fd'
        }
    } else if (name.includes('professional') || name.includes('pro')) {
        return {
            background: '#dbeafe',  // Blue
            color: '#1d4ed8',
            border: '1px solid #93c5fd'
        }
    } else if (name.includes('starter') || name.includes('basic')) {
        return {
            background: '#d1fae5',  // Green
            color: '#059669',
            border: '1px solid #6ee7b7'
        }
    } else {
        // Free Tier
        return {
            background: '#fef3c7',  // Gold/Yellow
            color: '#92400e',
            border: '1px solid #fde68a'
        }
    }
}
```

**Plan Color Scheme**:
| Plan Type | Color | Visual |
|-----------|-------|--------|
| **Enterprise/Premium** | Purple | 🟣 High-tier, premium features |
| **Professional/Pro** | Blue | 🔵 Mid-tier, business features |
| **Starter/Basic** | Green | 🟢 Entry-level, essential features |
| **Free Tier** | Gold | 🟡 Default, limited features |

---

### **3. Updated Badge Rendering**

**Before** (Static):
```tsx
<span style={{
    background: '#fef3c7',
    color: '#92400e',
    border: '1px solid #fde68a'
}}>
    {gym.subscription?.[0]?.plan?.name || 'Free Tier'}
</span>
```

**After** (Dynamic):
```tsx
{(() => {
    const planName = gym.subscription?.[0]?.plan?.name || 'Free Tier'
    const badgeStyle = getPlanBadgeStyle(planName)
    return (
        <span style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '700',
            ...badgeStyle  // Dynamic colors!
        }}>
            {planName}
        </span>
    )
})()}
```

---

## 🔄 How It Works

### **Data Flow**:

1. **Database Query** → Supabase fetches gyms with subscriptions
   ```sql
   SELECT gyms.*, 
          users.display_name, 
          gym_subscriptions.status,
          saas_plans.name
   FROM gyms
   LEFT JOIN users ON gyms.owner_user_id = users.id
   LEFT JOIN gym_subscriptions ON gyms.id = gym_subscriptions.gym_id
   LEFT JOIN saas_plans ON gym_subscriptions.plan_id = saas_plans.id
   WHERE gym_subscriptions.status = 'active'
   ```

2. **Service Layer** → Filters active subscriptions
   ```typescript
   subscription: gym.subscription?.filter(sub => sub.status === 'active')
   ```

3. **UI Layer** → Renders with dynamic styling
   ```typescript
   planName = gym.subscription?.[0]?.plan?.name || 'Free Tier'
   badgeStyle = getPlanBadgeStyle(planName)
   ```

---

## 📝 Database Requirements

### **Required Tables**:

1. **`gyms`**
   - `id` (uuid, primary key)
   - `name` (text)
   - `owner_user_id` (uuid, foreign key → users.id)
   - `created_at` (timestamptz)

2. **`gym_subscriptions`**
   - `id` (uuid, primary key)
   - `gym_id` (uuid, foreign key → gyms.id)
   - `plan_id` (uuid, foreign key → saas_plans.id)
   - `status` (text: 'active', 'expired', 'cancelled')
   - `created_at` (timestamptz)

3. **`saas_plans`**
   - `id` (uuid, primary key)
   - `name` (text: 'Free Tier', 'Starter', 'Professional', 'Enterprise')
   - `price_monthly` (numeric)
   - `price_yearly` (numeric)
   - `max_members_per_gym` (integer)
   - `max_trainers_per_gym` (integer)

### **Sample Data**:

```sql
-- Insert sample plans
INSERT INTO saas_plans (name, price_monthly, price_yearly, max_members_per_gym, max_trainers_per_gym)
VALUES 
    ('Free Tier', 0, 0, 50, 2),
    ('Starter', 999, 9999, 200, 5),
    ('Professional', 2999, 29999, 500, 15),
    ('Enterprise', 9999, 99999, 2000, 50);

-- Assign a plan to a gym
INSERT INTO gym_subscriptions (gym_id, plan_id, status)
VALUES 
    ('gym-uuid-here', 'plan-uuid-here', 'active');
```

---

## 🎨 Visual Examples

### **Dashboard Display**:

```
Recent Gym Partners
┌─────────────────┬──────────────────┬──────────┬──────────────────┐
│ GYM NAME        │ OWNER DETAILS    │ LOCATION │ PLAN             │
├─────────────────┼──────────────────┼──────────┼──────────────────┤
│ Muscle Hut      │ Dilpreet Singh   │ Patiala  │ [Enterprise] 🟣  │
│ Arnold GYM      │ Lalit Sharma     │ Mandi    │ [Professional] 🔵│
│ SUPER DEN       │ Vipin            │ Patiala  │ [Free Tier] 🟡   │
└─────────────────┴──────────────────┴──────────┴──────────────────┘
```

---

## 🧪 Testing Checklist

### **Test Scenarios**:

1. **Gym with Active Subscription**:
   - ✅ Should display actual plan name
   - ✅ Badge color matches plan tier
   - ✅ Plan name is readable and properly formatted

2. **Gym without Subscription**:
   - ✅ Should display "Free Tier"
   - ✅ Badge shows gold/yellow color
   - ✅ No errors in console

3. **Gym with Multiple Subscriptions**:
   - ✅ Should show only the active one
   - ✅ Expired subscriptions are filtered out

4. **Plan Name Variations**:
   - ✅ "Enterprise Elite" → Purple
   - ✅ "Pro Plan" → Blue
   - ✅ "Basic Starter" → Green
   - ✅ "Free" → Gold

---

## 🔧 Troubleshooting

### **Issue: All gyms show "Free Tier"**

**Possible Causes**:
1. No active subscriptions in database
2. RLS policies blocking subscription data
3. Foreign key relationships not set up

**Solution**:
```sql
-- Check if subscriptions exist
SELECT g.name, gs.status, sp.name as plan_name
FROM gyms g
LEFT JOIN gym_subscriptions gs ON g.id = gs.gym_id
LEFT JOIN saas_plans sp ON gs.plan_id = sp.id;

-- If empty, create subscriptions
INSERT INTO gym_subscriptions (gym_id, plan_id, status)
SELECT g.id, sp.id, 'active'
FROM gyms g
CROSS JOIN saas_plans sp
WHERE sp.name = 'Free Tier'
AND NOT EXISTS (
    SELECT 1 FROM gym_subscriptions WHERE gym_id = g.id
);
```

### **Issue: Badge colors not showing**

**Check**:
1. Browser cache (hard refresh: Ctrl+Shift+R)
2. HMR is working (check Vite console)
3. CSS is loading properly

---

## 🚀 Future Enhancements

1. **Plan Upgrade Indicators**:
   - Show "↑ Upgrade Available" for Free Tier users
   - Display savings for yearly plans

2. **Subscription Expiry Warnings**:
   - Badge turns orange when < 7 days remaining
   - Red when expired

3. **Usage Metrics**:
   - Show member count vs. plan limit
   - Visual progress bars

4. **Quick Actions**:
   - "Change Plan" button in badge tooltip
   - Direct link to subscription management

---

**Status**: ✅ Fully Implemented  
**Last Updated**: December 20, 2025  
**Developer**: AI Assistant (Claude 3.5 Sonnet)
