# Admin Dashboard Architecture (React + TypeScript)

## Overview

A comprehensive admin dashboard for gym owners to manage members, trainers, classes, and business operations.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 |
| Language | TypeScript |
| Build Tool | Vite |
| Routing | React Router v6 |
| State | Zustand / React Context |
| Data Fetching | TanStack Query |
| Forms | React Hook Form + Zod |
| UI Components | Custom + Shadcn/ui |
| Charts | Recharts |
| Tables | TanStack Table |
| Icons | Lucide React |
| Date Handling | date-fns |
| Firebase | Firebase JS SDK v9+ |

---

## Project Structure

```
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
│
├── components/
│   ├── ui/                    # Base components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── PageContainer.tsx
│   │   └── MainLayout.tsx
│   ├── charts/
│   │   ├── AreaChart.tsx
│   │   ├── BarChart.tsx
│   │   └── PieChart.tsx
│   └── shared/
│       ├── DataTable.tsx
│       ├── StatCard.tsx
│       ├── StatusBadge.tsx
│       └── LoadingSpinner.tsx
│
├── features/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── useAuth.ts
│   │   └── AuthGuard.tsx
│   ├── dashboard/
│   │   ├── DashboardPage.tsx
│   │   └── components/
│   ├── members/
│   │   ├── MembersPage.tsx
│   │   ├── MemberDetailPage.tsx
│   │   ├── AddMemberModal.tsx
│   │   └── hooks/
│   ├── trainers/
│   ├── classes/
│   ├── plans/
│   ├── attendance/
│   ├── payments/
│   ├── leads/
│   └── settings/
│
├── lib/
│   ├── firebase.ts
│   ├── api.ts
│   └── utils.ts
│
├── hooks/
│   ├── useFirestore.ts
│   ├── useNotifications.ts
│   └── usePagination.ts
│
├── types/
│   ├── user.types.ts
│   ├── membership.types.ts
│   └── ...
│
├── styles/
│   ├── globals.css
│   └── variables.css
│
└── index.tsx
```

---

## Page Specifications

### 1. Login Page

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                    🏋️ FitZone Admin                         │
│                                                              │
│                  ┌────────────────────────┐                 │
│                  │ Email                   │                 │
│                  │ admin@fitzone.com       │                 │
│                  └────────────────────────┘                 │
│                  ┌────────────────────────┐                 │
│                  │ Password               │                 │
│                  │ ••••••••               │                 │
│                  └────────────────────────┘                 │
│                                                              │
│                  [ Sign In ]                                 │
│                                                              │
│                  Forgot Password?                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### 2. Dashboard Page

**KPI Cards Row:**
- Total Members (trend)
- Active Memberships
- Revenue This Month
- Check-ins Today

**Charts Section:**
- Member Growth (Area Chart)
- Revenue Trend (Bar Chart)
- Membership Distribution (Pie Chart)

**Quick Info:**
- Expiring Memberships (7 days)
- Today's Classes
- Recent Leads

---

### 3. Members Page

**Features:**
- Data table with search, filter, sort
- Add new member button
- Export to CSV
- Bulk actions

**Table Columns:**
- Avatar + Name
- Phone
- Email
- Membership Status
- Trainer
- Join Date
- Actions

---

### 4. Member Detail Page

**Tabs:**
- Overview
- Membership
- Workout Plans
- Diet Plans
- Progress
- Attendance
- Payments

---

### 5. Trainers Page

Similar to Members with trainer-specific fields (specializations, rating, client count).

---

### 6. Classes Page

**Features:**
- Calendar view (week/month)
- List view
- Create class modal
- Booking management

---

### 7. Plans Management

**Sub-sections:**
- Membership Plans
- Workout Templates
- Diet Templates

---

### 8. Attendance Page

**Features:**
- Date picker
- Branch filter
- QR Scanner integration
- Manual check-in
- Export attendance report

---

### 9. Payments Page

**Features:**
- Payment list with filters
- Date range picker
- Status filter
- Record offline payment
- Invoice generation
- Revenue analytics

---

### 10. Leads Page

**Features:**
- Lead list with pipeline stages
- Add lead form
- Follow-up reminders
- Convert to member

---

### 11. Settings Page

**Sections:**
- Profile Settings
- Branch Management
- Membership Plans Config
- Notification Settings
- Staff Management
- Integrations (Razorpay)

---

## Component Specifications

### Sidebar Navigation

```typescript
const navigation = [
  { name: 'Dashboard', icon: Home, path: '/' },
  { name: 'Members', icon: Users, path: '/members' },
  { name: 'Trainers', icon: UserCheck, path: '/trainers' },
  { name: 'Classes', icon: Calendar, path: '/classes' },
  { divider: true },
  { name: 'Plans', icon: FileText, path: '/plans', children: [
    { name: 'Membership Plans', path: '/plans/membership' },
    { name: 'Workout Templates', path: '/plans/workouts' },
    { name: 'Diet Templates', path: '/plans/diets' },
  ]},
  { name: 'Attendance', icon: CheckSquare, path: '/attendance' },
  { name: 'Payments', icon: CreditCard, path: '/payments' },
  { name: 'Leads', icon: Target, path: '/leads' },
  { divider: true },
  { name: 'Settings', icon: Settings, path: '/settings' },
];
```

### DataTable Component

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  pagination?: {
    pageSize: number;
    pageIndex: number;
    pageCount: number;
    onPageChange: (page: number) => void;
  };
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  filters?: FilterConfig[];
  actions?: {
    onAdd?: () => void;
    onExport?: () => void;
    onBulkDelete?: (ids: string[]) => void;
  };
}
```

### StatCard Component

```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: LucideIcon;
  chart?: ChartData;
}
```

---

## Firebase Integration

### Authentication Hook

```typescript
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        setUser(firebaseUser);
        setRole(userDoc.data()?.role);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
  }, []);

  return { user, role, loading, signIn, signOut };
}
```

### Firestore Hook

```typescript
export function useCollection<T>(
  collectionName: string,
  queryConstraints: QueryConstraint[] = []
) {
  return useQuery({
    queryKey: [collectionName, ...queryConstraints],
    queryFn: async () => {
      const q = query(collection(db, collectionName), ...queryConstraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    }
  });
}
```

---

## Routing Configuration

```typescript
const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: <AuthGuard><MainLayout /></AuthGuard>,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'members', element: <MembersPage /> },
      { path: 'members/:id', element: <MemberDetailPage /> },
      { path: 'trainers', element: <TrainersPage /> },
      { path: 'trainers/:id', element: <TrainerDetailPage /> },
      { path: 'classes', element: <ClassesPage /> },
      { path: 'plans/*', element: <PlansRoutes /> },
      { path: 'attendance', element: <AttendancePage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'leads', element: <LeadsPage /> },
      { path: 'settings/*', element: <SettingsRoutes /> },
    ]
  }
]);
```

---

## Role-Based Access Control

```typescript
const permissions = {
  superadmin: ['*'],
  admin: [
    'dashboard:view',
    'members:*',
    'trainers:*',
    'classes:*',
    'plans:*',
    'attendance:*',
    'payments:*',
    'leads:*',
    'settings:branch',
  ],
  trainer: [
    'dashboard:view',
    'members:view',
    'members:edit:assigned',
    'classes:view',
    'classes:edit:own',
    'attendance:view',
  ]
};

function hasPermission(role: string, action: string): boolean {
  const rolePerms = permissions[role] || [];
  return rolePerms.includes('*') || rolePerms.includes(action);
}
```

---

## Next: [API Contracts →](./07-api-contracts.md)
