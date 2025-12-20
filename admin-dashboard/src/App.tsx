import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthGuard } from './components/auth/AuthGuard'
import { MainLayout } from './components/layout/MainLayout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { MembersPage } from './pages/MembersPage'
import { TrainersPage } from './pages/TrainersPage'
import { ClassesPage } from './pages/ClassesPage'
import { AttendancePage } from './pages/AttendancePage'
import { PaymentsPage } from './pages/PaymentsPage'
import { SettingsPage } from './pages/SettingsPage'
import { GymsPage } from './pages/GymsPage'
import { PlansPage } from './pages/PlansPage'
import { PlanManagementPage } from './pages/PlanManagementPage'
import { SuperAdminDashboard } from './pages/super-admin/Dashboard'
import { GymOwnersPage } from './pages/super-admin/GymOwners'
import { SubscriptionsPage } from './pages/super-admin/Subscriptions'

import { inspectUserTable } from './debug/inspect_users'

// Role-based redirection component
function HomeRedirect() {
    const { isSuperAdmin, loading } = useAuth()

    if (loading) return null; // Let AuthGuard handle loading

    if (isSuperAdmin) {
        return <Navigate to="/admin" replace />
    }
    return <DashboardPage />
}

function App() {
    if (process.env.NODE_ENV === 'development') {
        inspectUserTable()
    }
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route element={<AuthGuard><MainLayout /></AuthGuard>}>
                    {/* Common / Gym Owner Routes */}
                    <Route path="/" element={<HomeRedirect />} />
                    <Route path="/members" element={<MembersPage />} />
                    <Route path="/trainers" element={<TrainersPage />} />
                    <Route path="/classes" element={<ClassesPage />} />
                    <Route path="/attendance" element={<AttendancePage />} />
                    <Route path="/payments" element={<PaymentsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/gyms" element={<GymsPage />} />
                    <Route path="/plans" element={<PlansPage />} />

                    {/* Super Admin Routes */}
                    <Route path="/admin" element={<SuperAdminDashboard />} />
                    <Route path="/admin/gyms" element={<GymOwnersPage />} />
                    <Route path="/admin/plans" element={<PlanManagementPage />} />
                    <Route path="/admin/subscriptions" element={<SubscriptionsPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    )
}

export default App
