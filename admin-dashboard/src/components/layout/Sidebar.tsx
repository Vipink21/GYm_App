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
    Crown,
    Building2,
    Tag
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import styles from './Sidebar.module.css'
interface NavItem {
    name?: string
    path?: string
    icon?: any
    divider?: boolean
}

export function Sidebar() {
    const { userData, signOut, isSuperAdmin } = useAuth()
    const location = useLocation()
    const userRole = userData?.role || 'member'

    const gymOwnerNav: NavItem[] = [
        { name: 'Dashboard', path: '/', icon: Home },
        { name: 'Members', path: '/members', icon: Users },
        { name: 'Trainers', path: '/trainers', icon: UserCheck },
        { name: 'Classes', path: '/classes', icon: Calendar },
        { divider: true },
        { name: 'Attendance', path: '/attendance', icon: ClipboardCheck },
        { name: 'Payments', path: '/payments', icon: CreditCard },
        { divider: true },
        { name: 'Gym Profile', path: '/gyms', icon: Dumbbell },
        { name: 'Membership Plans', path: '/plans', icon: Crown },
        { name: 'Settings', path: '/settings', icon: Settings },
    ]

    const trainerNav: NavItem[] = [
        { name: 'Work Dashboard', path: '/', icon: Home },
        { name: 'Member List', path: '/members', icon: Users },
        { name: 'Class Schedule', path: '/classes', icon: Calendar },
        { name: 'Mark Attendance', path: '/attendance', icon: ClipboardCheck },
        { name: 'Profile Settings', path: '/settings', icon: Settings },
    ]

    const memberNav: NavItem[] = [
        { name: 'My Profile', path: '/', icon: Home },
        { name: 'Track Attendance', path: '/attendance', icon: ClipboardCheck },
        { name: 'Book Classes', path: '/classes', icon: Calendar },
        { name: 'My Payments', path: '/payments', icon: CreditCard },
        { name: 'Settings', path: '/settings', icon: Settings },
    ]

    const superAdminNav: NavItem[] = [
        { name: 'Dashboard', path: '/admin', icon: Home },
        { name: 'Gym Partners', path: '/admin/gyms', icon: Building2 },
        { name: 'Revenue & Subs', path: '/admin/subscriptions', icon: CreditCard },
        { name: 'SaaS Plans', path: '/admin/plans', icon: Crown },
        { divider: true },
        { name: 'Broadcast', path: '/admin/broadcast', icon: ClipboardCheck },
        { name: 'Coupons', path: '/admin/coupons', icon: Tag },
        { name: 'Exercises', path: '/admin/exercises', icon: Dumbbell },
        { name: 'Audit Logs', path: '/admin/audit', icon: ClipboardCheck },
        { name: 'Support', path: '/admin/support', icon: Users },
        { name: 'System Settings', path: '/admin/settings', icon: Settings },
    ]

    let navigation: NavItem[] = memberNav
    if (isSuperAdmin) navigation = superAdminNav
    else if (userRole === 'admin' || userRole === 'gym_owner') navigation = gymOwnerNav
    else if (userRole === 'trainer') navigation = trainerNav

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
                    if (item.divider) {
                        return <div key={index} className={styles.divider} />
                    }

                    const Icon = item.icon
                    const isActive = location.pathname === item.path

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path || '#'}
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
                        {userData?.profile?.firstName?.charAt(0) || userData?.profile?.email?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className={styles.userDetails}>
                        <span className={styles.userName}>
                            {userData?.profile?.firstName ? `${userData?.profile?.firstName} ${userData?.profile?.lastName}` : userData?.profile?.email?.split('@')[0]}
                        </span>
                        <span className={styles.userRole}>{userData?.role?.replace('_', ' ')}</span>
                    </div>
                </div>
                <button className={styles.logoutBtn} onClick={signOut}>
                    <LogOut size={20} />
                </button>
            </div>
        </aside>
    )
}
