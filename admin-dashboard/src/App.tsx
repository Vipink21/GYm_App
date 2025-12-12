import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AuthGuard } from './components/auth/AuthGuard'
import { MainLayout } from './components/layout/MainLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { MembersPage } from './pages/MembersPage'
import { TrainersPage } from './pages/TrainersPage'
import { ClassesPage } from './pages/ClassesPage'
import { AttendancePage } from './pages/AttendancePage'
import { PaymentsPage } from './pages/PaymentsPage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route element={<AuthGuard><MainLayout /></AuthGuard>}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/members" element={<MembersPage />} />
                    <Route path="/trainers" element={<TrainersPage />} />
                    <Route path="/classes" element={<ClassesPage />} />
                    <Route path="/attendance" element={<AttendancePage />} />
                    <Route path="/payments" element={<PaymentsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    )
}

export default App
