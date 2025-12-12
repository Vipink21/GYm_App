# Role-Based Access Control (RBAC)

## User Roles

| Role | Scope | Description |
|------|-------|-------------|
| **Member** | Own data | Gym members using the app |
| **Trainer** | Assigned clients | Fitness trainers managing clients |
| **Admin** | Single branch | Gym owner/manager |
| **Super Admin** | All branches | Platform owner (SaaS admin) |

---

## Permissions Matrix

### Mobile App Permissions

| Feature | Member | Trainer |
|---------|--------|---------|
| View own profile | ✓ | ✓ |
| Edit own profile | ✓ | ✓ |
| View workout plan | ✓ (own) | ✓ (clients) |
| Edit workout plan | ✗ | ✓ (clients) |
| View diet plan | ✓ (own) | ✓ (clients) |
| Edit diet plan | ✗ | ✓ (clients) |
| Log progress | ✓ | ✓ (clients) |
| View progress | ✓ (own) | ✓ (clients) |
| QR Check-in | ✓ | ✓ |
| Book classes | ✓ | ✓ |
| Manage classes | ✗ | ✓ (own) |
| AI Trainer | ✓ | ✓ |
| View payments | ✓ (own) | ✗ |
| View members | ✗ | ✓ (assigned) |

### Admin Dashboard Permissions

| Feature | Admin | Super Admin |
|---------|-------|-------------|
| Dashboard | ✓ (branch) | ✓ (all) |
| Members CRUD | ✓ (branch) | ✓ (all) |
| Trainers CRUD | ✓ (branch) | ✓ (all) |
| Classes CRUD | ✓ (branch) | ✓ (all) |
| Attendance | ✓ (branch) | ✓ (all) |
| Payments | ✓ (branch) | ✓ (all) |
| Leads | ✓ (branch) | ✓ (all) |
| Membership Plans | ✓ (branch) | ✓ (all) |
| Workout Templates | ✓ (branch) | ✓ (all) |
| Branch Settings | ✓ | ✗ |
| Create Branches | ✗ | ✓ |
| Gym Settings | ✗ | ✓ |
| Revenue Analytics | ✓ (branch) | ✓ (all) |
| Feature Toggles | ✗ | ✓ |

---

## Security Rules Implementation

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function isRole(role) {
      return getUserData().role == role;
    }
    
    function isAdmin() {
      return isRole('admin') || isRole('superadmin');
    }
    
    function isSameGym(gymId) {
      return getUserData().gymId == gymId;
    }
    
    function isSameBranch(branchId) {
      return getUserData().branchId == branchId;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isAssignedTrainer(userId) {
      let user = get(/databases/$(database)/documents/users/$(userId)).data;
      return user.assignedTrainerId == request.auth.uid;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn() && (
        isOwner(userId) ||
        isAdmin() ||
        (isRole('trainer') && isAssignedTrainer(userId))
      );
      
      allow create: if isAdmin();
      
      allow update: if isSignedIn() && (
        isOwner(userId) ||
        isAdmin()
      );
      
      allow delete: if isRole('superadmin');
    }
    
    // Memberships collection
    match /memberships/{membershipId} {
      allow read: if isSignedIn() && (
        resource.data.userId == request.auth.uid ||
        isAdmin()
      );
      
      allow write: if isAdmin();
    }
    
    // Workout Plans
    match /workoutPlans/{planId} {
      allow read: if isSignedIn() && (
        resource.data.userId == request.auth.uid ||
        isAdmin() ||
        (isRole('trainer') && isAssignedTrainer(resource.data.userId))
      );
      
      allow create: if isAdmin() || isRole('trainer');
      
      allow update: if isSignedIn() && (
        isAdmin() ||
        (isRole('trainer') && isAssignedTrainer(resource.data.userId))
      );
      
      allow delete: if isAdmin();
    }
    
    // Attendance - read own or admin
    match /attendance/{attendanceId} {
      allow read: if isSignedIn() && (
        resource.data.userId == request.auth.uid ||
        isAdmin()
      );
      
      allow create: if isAdmin() || isRole('trainer');
      allow update, delete: if isAdmin();
    }
    
    // Classes - public read, admin write
    match /classes/{classId} {
      allow read: if isSignedIn() && isSameGym(resource.data.gymId);
      allow write: if isAdmin() || (
        isRole('trainer') && resource.data.trainerId == request.auth.uid
      );
    }
    
    // Class Bookings
    match /classBookings/{bookingId} {
      allow read: if isSignedIn() && (
        resource.data.userId == request.auth.uid ||
        isAdmin()
      );
      
      allow create: if isSignedIn() && 
        request.resource.data.userId == request.auth.uid;
      
      allow update: if isSignedIn() && (
        resource.data.userId == request.auth.uid ||
        isAdmin()
      );
      
      allow delete: if isAdmin();
    }
    
    // Payments - read own or admin
    match /payments/{paymentId} {
      allow read: if isSignedIn() && (
        resource.data.userId == request.auth.uid ||
        isAdmin()
      );
      
      allow write: if isAdmin();
    }
    
    // Notifications - own only
    match /notifications/{notificationId} {
      allow read, update: if isSignedIn() && 
        resource.data.userId == request.auth.uid;
      
      allow delete: if isSignedIn() && 
        resource.data.userId == request.auth.uid;
    }
    
    // AI Conversations - own only
    match /aiConversations/{conversationId} {
      allow read, write: if isSignedIn() && 
        resource.data.userId == request.auth.uid;
    }
    
    // Public collections (exercises, templates)
    match /exercises/{exerciseId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
    
    match /templates/{templateId} {
      allow read: if isSignedIn() && isSameGym(resource.data.gymId);
      allow write: if isAdmin();
    }
    
    // Gyms and Branches - super admin only for write
    match /gyms/{gymId} {
      allow read: if isSignedIn() && isSameGym(gymId);
      allow write: if isRole('superadmin');
    }
    
    match /branches/{branchId} {
      allow read: if isSignedIn();
      allow write: if isRole('superadmin') || (
        isRole('admin') && isSameBranch(branchId)
      );
    }
  }
}
```

---

## Cloud Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // User profile photos
    match /users/{userId}/profile/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Progress photos (private)
    match /users/{userId}/progress/{fileName} {
      allow read: if request.auth.uid == userId ||
                    isAssignedTrainer(userId) ||
                    isAdmin();
      allow write: if request.auth.uid == userId;
    }
    
    // Gym assets (public within gym)
    match /gyms/{gymId}/{allPaths=**} {
      allow read: if userBelongsToGym(gymId);
      allow write: if isGymAdmin(gymId);
    }
    
    // Exercise media (public)
    match /exercises/{fileName} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
  }
}
```

---

## API Authorization

### Cloud Functions Authorization

```typescript
// Middleware for callable functions
function requireAuth(context: functions.https.CallableContext) {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    );
  }
  return context.auth.uid;
}

function requireRole(
  context: functions.https.CallableContext, 
  allowedRoles: string[]
) {
  const uid = requireAuth(context);
  
  // Fetch user document
  const userDoc = await db.doc(`users/${uid}`).get();
  const role = userDoc.data()?.role;
  
  if (!allowedRoles.includes(role)) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Insufficient permissions'
    );
  }
  
  return { uid, role, user: userDoc.data() };
}

// Usage
export const adminOnlyFunction = functions.https.onCall(
  async (data, context) => {
    const { uid, user } = await requireRole(context, ['admin', 'superadmin']);
    // ... function logic
  }
);
```

---

## Multi-Tenancy Rules

### Data Access Patterns

```typescript
// Member sees only own data
const myWorkouts = await db.collection('workoutPlans')
  .where('userId', '==', currentUser.uid)
  .get();

// Trainer sees assigned clients
const myClients = await db.collection('users')
  .where('assignedTrainerId', '==', currentUser.uid)
  .get();

// Admin sees branch data
const branchMembers = await db.collection('users')
  .where('branchId', '==', currentUser.branchId)
  .where('role', '==', 'member')
  .get();

// Super admin sees all gym data
const allMembers = await db.collection('users')
  .where('gymId', '==', currentUser.gymId)
  .where('role', '==', 'member')
  .get();
```

---

## Token-Based Claims (Optional)

For performance optimization, custom claims can be used:

```typescript
// Set custom claims on user creation/update
await admin.auth().setCustomUserClaims(userId, {
  role: 'admin',
  gymId: 'gym_123',
  branchId: 'branch_456'
});

// Access in security rules
request.auth.token.role == 'admin'
request.auth.token.gymId == resource.data.gymId
```

---

## Summary

The RBAC system ensures:
1. **Data Isolation**: Users see only relevant data
2. **Role Enforcement**: Actions restricted by role
3. **Multi-Tenancy**: Branch/gym level isolation
4. **Audit Trail**: All actions traceable
