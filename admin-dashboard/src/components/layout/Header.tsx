import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import styles from './Header.module.css'

const pageTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/members': 'Members',
    '/trainers': 'Trainers',
    '/classes': 'Classes',
    '/attendance': 'Attendance',
    '/payments': 'Payments',
    '/settings': 'Settings',
}

export function Header() {
    const location = useLocation()
    const title = pageTitles[location.pathname] || 'Dashboard'

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <h1 className={styles.title}>{title}</h1>
            </div>

            <div className={styles.right}>
                {/* Search */}
                <div className={styles.search}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className={styles.searchInput}
                    />
                </div>

                {/* Notifications */}
                <button className={styles.notificationBtn}>
                    <Bell size={20} />
                    <span className={styles.notificationBadge}>3</span>
                </button>
            </div>
        </header>
    )
}
