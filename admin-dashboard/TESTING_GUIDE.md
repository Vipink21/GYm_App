# Super Admin Panel - Testing Guide

**Server Status**: ✅ Running at http://localhost:3000  
**Last Updated**: December 20, 2025 @ 2:00 PM IST

---

## 🧪 Pre-Testing Checklist

### **Database Requirements**:
Before testing, ensure these tables exist in Supabase:

1. **`audit_logs`** - For tracking all admin actions
   ```sql
   - id (uuid, primary key)
   - admin_id (uuid, references users)
   - action (text)
   - entity (text)
   - entity_id (uuid, nullable)
   - details (jsonb)
   - ip_address (text, nullable)
   - created_at (timestamptz)
   ```

2. **`exercises`** - Global exercise library
   ```sql
   - id, name, muscle_group, difficulty
   - equipment, description, video_url
   - is_global (boolean), gym_id (nullable)
   ```

3. **`notifications`** - Broadcast system
   ```sql
   - id, user_id, target_role, title, message
   - type, is_read, link, created_at
   ```

4. **`support_tickets`** - Partner support
   ```sql
   - id, gym_id, user_id, subject, description
   - priority, status, category, created_at, updated_at
   ```

5. **`coupons`** - Discount codes
   ```sql
   - id, code, discount_type, discount_value
   - max_uses, current_uses, expiry_date, is_active
   ```

6. **`system_settings`** - Platform configuration
   ```sql
   - key (text, primary key)
   - value (text)
   - description (text)
   - updated_at (timestamptz)
   ```

---

## 🔐 Test User Setup

### **Super Admin Account**:
- Email: `admin@fitzone.com` (or your configured super admin)
- Ensure `is_super_admin` flag is set to `true` in the `users` table
- Or use the RLS policy: `public.is_super_admin_v5()`

---

## ✅ Feature Testing Workflow

### **1. Global Exercise Library** 🏋️

#### **Test: Create Exercise**
1. Navigate to `/admin/exercises`
2. Click **"Add New Exercise"**
3. Fill in the form:
   - Name: "Barbell Bench Press"
   - Muscle Group: "Chest"
   - Difficulty: "Intermediate"
   - Equipment: "Barbell"
   - Description: "Classic compound movement for chest development"
   - Video URL: (optional YouTube link)
4. Click **"Save Exercise"**
5. ✅ **Expected**: Success toast, exercise appears in table
6. ✅ **Verify Audit**: Check `audit_logs` for `action='create'`, `entity='exercise'`

#### **Test: Update Exercise**
1. Click the **Edit** icon on any exercise
2. Modify the description
3. Click **"Save Exercise"**
4. ✅ **Expected**: Success toast, changes reflected
5. ✅ **Verify Audit**: Check for `action='update'`

#### **Test: Delete Exercise**
1. Click the **Delete** icon (red trash)
2. Confirm the deletion in the SweetAlert modal
3. ✅ **Expected**: Exercise removed from list
4. ✅ **Verify Audit**: Check for `action='delete'`

#### **Test: Search & Filter**
1. Type "bench" in the search box
2. ✅ **Expected**: Only matching exercises shown
3. Select "Chest" from the muscle group filter
4. ✅ **Expected**: Only chest exercises displayed

---

### **2. Broadcast Center** 📢

#### **Test: Send Broadcast**
1. Navigate to `/admin/broadcast`
2. Fill in the compose form:
   - Target Audience: "Gym Owners Only"
   - Alert Type: "Information (Blue)"
   - Title: "Platform Maintenance"
   - Message: "Scheduled maintenance on Dec 25th from 2-4 AM IST"
3. Click **"Send Broadcast"**
4. ✅ **Expected**: Success toast, broadcast appears in history
5. ✅ **Verify Audit**: Check for `action='broadcast'`, `entity='notification'`
6. ✅ **Verify Notification**: Check `notifications` table for new entry

#### **Test: View History**
1. Scroll to "Sent History" section
2. ✅ **Expected**: Recent broadcasts listed with type badges
3. Verify color coding: Info (blue), Success (green), Warning (yellow), Error (red)

---

### **3. Support Tickets** 🎫

#### **Test: View Tickets**
1. Navigate to `/admin/support`
2. ✅ **Expected**: Tickets displayed in card grid
3. Check priority badges: Low, Medium, High, Urgent

#### **Test: Filter by Status**
1. Click "Open" tab
2. ✅ **Expected**: Only open tickets shown
3. Try "In Progress" and "Resolved" tabs

#### **Test: Reply to Ticket**
1. Click **"Reply"** button on any ticket
2. Modal opens showing ticket subject
3. Type a response: "Thank you for reaching out. We're looking into this."
4. Click **"Send Response"**
5. ✅ **Expected**: Success toast, ticket status changes to "In Progress"
6. ✅ **Verify Audit**: Check for `action='ticket_reply'`

#### **Test: Change Status**
1. Use the status dropdown on a ticket
2. Select "Resolved"
3. ✅ **Expected**: Success toast
4. ✅ **Verify Audit**: Check for `action='update_status'`

---

### **4. Gym Partners Management** 🏢

#### **Test: Search Gyms**
1. Navigate to `/admin/gyms`
2. Type a gym name in the search box
3. ✅ **Expected**: Filtered results

#### **Test: Delete Gym**
1. Click the red **Delete** button
2. Confirm in the modal
3. ✅ **Expected**: Gym removed, success toast
4. ✅ **Verify Audit**: Check for `action='delete'`, `entity='gym'`

---

### **5. SaaS Plan Management** 💳

#### **Test: Create Plan**
1. Navigate to `/admin/plans`
2. Click **"Add New Plan"**
3. Fill in:
   - Name: "Enterprise Elite"
   - Description: "For large gym chains"
   - Monthly Price: 9999
   - Yearly Price: 99999
   - Max Members: 1000
   - Max Trainers: 50
4. Click **"Create Plan"**
5. ✅ **Expected**: Plan appears in table
6. ✅ **Verify Audit**: Check for `action='create'`, `entity='saas_plan'`

#### **Test: Toggle Plan Status**
1. Click the toggle icon (green/gray)
2. ✅ **Expected**: Status changes, icon updates
3. ✅ **Verify Audit**: Check for `action='activate'` or `action='deactivate'`

#### **Test: Delete Plan**
1. Click the delete icon
2. Confirm deletion
3. ✅ **Expected**: Plan removed (or error if has active subscriptions)
4. ✅ **Verify Audit**: Check for `action='delete'`

---

### **6. Coupon Management** 🎟️

#### **Test: Create Coupon**
1. Navigate to `/admin/coupons`
2. Click **"Create New Coupon"**
3. Fill in:
   - Code: "NEWYEAR50"
   - Type: "Percentage (%)"
   - Value: 50
   - Max Uses: 100
   - Expiry: (future date)
4. Click **"Generate Coupon"**
5. ✅ **Expected**: Coupon card appears
6. ✅ **Verify Audit**: Check for `action='create'`, `entity='coupon'`

#### **Test: Toggle Coupon**
1. Click the power icon to pause/activate
2. ✅ **Expected**: Badge shows "PAUSED" or active state
3. ✅ **Verify Audit**: Check for `action='activate'` or `action='deactivate'`

---

### **7. System Settings** ⚙️

#### **Test: Update Razorpay Keys**
1. Navigate to `/admin/settings`
2. Enter test keys:
   - Key ID: `rzp_test_1234567890`
   - Key Secret: `secret_test_abcdefgh`
3. Click the eye icon to toggle secret visibility
4. Click **"Save Configuration"**
5. ✅ **Expected**: Success toast
6. ✅ **Verify Audit**: Check for `action='update_settings'`, `entity='system_config'`

---

### **8. Audit Logs** 📋

#### **Test: View Audit Trail**
1. Navigate to `/admin/audit`
2. ✅ **Expected**: All logged actions visible
3. Check for recent actions from above tests
4. Verify details show: admin name, action, entity, timestamp

#### **Test: Search Audit Logs**
1. Type "exercise" in search
2. ✅ **Expected**: Only exercise-related actions shown

---

## 🎨 UI/UX Testing

### **Design System Verification**:

1. **Animations**:
   - ✅ Page fadeIn on load
   - ✅ Card slideIn on Broadcast page
   - ✅ Hover effects on tables and cards
   - ✅ Button hover states (gold glow)

2. **Color Consistency**:
   - ✅ Gold primary: `#D4AF37`
   - ✅ Success badges: Green
   - ✅ Error badges: Red
   - ✅ Info badges: Blue
   - ✅ Warning badges: Yellow

3. **Typography**:
   - ✅ Headings use Poppins (800 weight)
   - ✅ Body text uses Inter
   - ✅ Consistent font sizes across pages

4. **Spacing**:
   - ✅ Uniform padding (var(--space-*))
   - ✅ Consistent gaps in grids and flexbox

5. **Interactive Elements**:
   - ✅ Focus states on inputs (gold ring)
   - ✅ Disabled states are visually distinct
   - ✅ Loading spinners on async actions

---

## 🐛 Edge Cases to Test

1. **Empty States**:
   - ✅ No exercises in library
   - ✅ No broadcast history
   - ✅ No support tickets
   - ✅ No audit logs

2. **Validation**:
   - ✅ Try creating exercise without name
   - ✅ Try sending broadcast without message
   - ✅ Try creating coupon with invalid code

3. **Long Content**:
   - ✅ Exercise description with 500+ characters
   - ✅ Broadcast message with 1000+ characters
   - ✅ Gym name with special characters

4. **Concurrent Actions**:
   - ✅ Delete exercise while modal is open
   - ✅ Update plan while another admin is viewing

---

## 📊 Performance Checks

1. **Load Times**:
   - ✅ Page loads in < 2 seconds
   - ✅ HMR updates in < 500ms
   - ✅ API calls complete in < 1 second

2. **Responsiveness**:
   - ✅ Test on tablet (768px)
   - ✅ Test on mobile (375px)
   - ✅ Grid layouts adapt correctly

3. **Memory**:
   - ✅ No memory leaks on page navigation
   - ✅ Modals properly unmount

---

## 🔒 Security Testing

1. **RLS Policies**:
   - ✅ Non-super-admin cannot access `/admin/*` routes
   - ✅ Gym owners cannot see other gyms' data
   - ✅ Audit logs are read-only for non-admins

2. **Input Sanitization**:
   - ✅ SQL injection attempts fail
   - ✅ XSS attempts are escaped
   - ✅ File upload validation (if applicable)

---

## 📝 Test Results Template

```
Date: _______________
Tester: _______________

Feature: Global Exercise Library
- Create: ☐ Pass ☐ Fail
- Update: ☐ Pass ☐ Fail
- Delete: ☐ Pass ☐ Fail
- Search: ☐ Pass ☐ Fail

Feature: Broadcast Center
- Send: ☐ Pass ☐ Fail
- History: ☐ Pass ☐ Fail

Feature: Support Tickets
- View: ☐ Pass ☐ Fail
- Reply: ☐ Pass ☐ Fail
- Status Change: ☐ Pass ☐ Fail

Feature: Gym Management
- Search: ☐ Pass ☐ Fail
- Delete: ☐ Pass ☐ Fail

Feature: Plan Management
- Create: ☐ Pass ☐ Fail
- Toggle: ☐ Pass ☐ Fail
- Delete: ☐ Pass ☐ Fail

Feature: Coupon Management
- Create: ☐ Pass ☐ Fail
- Toggle: ☐ Pass ☐ Fail

Feature: System Settings
- Update: ☐ Pass ☐ Fail

Feature: Audit Logs
- View: ☐ Pass ☐ Fail
- Search: ☐ Pass ☐ Fail

Overall Status: ☐ All Pass ☐ Issues Found
```

---

## 🚀 Next Steps After Testing

1. **If All Tests Pass**:
   - Deploy to staging environment
   - Run automated E2E tests
   - Prepare for production release

2. **If Issues Found**:
   - Document bugs in issue tracker
   - Prioritize by severity
   - Fix critical issues first

3. **Post-Launch**:
   - Monitor audit logs for unusual activity
   - Track support ticket resolution times
   - Gather user feedback on new features

---

**Happy Testing!** 🎉
