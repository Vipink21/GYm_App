import { NavLink, useLocation } from 'react-router-dom'
import {
    Home,
    Users,
    UserCheck,
    Calendar,
    ClipboardCheck,
    CreditCard,
    Settings,
    Dumbbell,
    LogOut,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import styles from './Sidebar.module.css'

const navigation = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Members', path: '/members', icon: Users },
    { name: 'Trainers', path: '/trainers', icon: UserCheck },
    { name: 'Classes', path: '/classes', icon: Calendar },
    { divider: true },
    { name: 'Attendance', path: '/attendance', icon: ClipboardCheck },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { divider: true },
    { name: 'Settings', path: '/settings', icon: Settings },
]

export function Sidebar() {
    const { userData, signOut } = useAuth()
    const location = useLocation()

    return (
        <aside className={styles.sidebar}>
            {/* Logo */}
            <div className={styles.logo}>
                <Dumbbell className={styles.logoIcon} />
                <div className={styles.logoText}>
                    <span className={styles.logoTitle}>FitZone</span>
                    <span className={styles.logoSubtitle}>Admin Portal</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className={styles.nav}>
                {navigation.map((item, index) => {
                    if ('divider' in item) {
                        return <div key={index} className={styles.divider} />
                    }

                    const Icon = item.icon
                    const isActive = location.pathname === item.path

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        >
                            <Icon size={20} />
                            <span>{item.name}</span>
                        </NavLink>
                    )
                })}
            </nav>

            {/* User Info & Logout */}
            <div className={styles.footer}>
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                        {userData?.profile?.firstName?.charAt(0) || 'A'}
                    </div>
                    <div className={styles.userDetails}>
                        <span className={styles.userName}>
                            {userData?.profile?.firstName} {userData?.profile?.lastName}
                        </span>
                        <span className={styles.userRole}>{userData?.role}</span>
                    </div>
                </div>
                <button className={styles.logoutBtn} onClick={signOut}>
                    <LogOut size={20} />
                </button>
            </div>
        </aside>
    )
}
