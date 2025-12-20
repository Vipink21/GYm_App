import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Search, Clock, Info, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react'
import styles from './Header.module.css'
import { notificationService, AppNotification } from '../../services/notificationService'
import { useAuth } from '../../contexts/AuthContext'

const pageTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/members': 'Members',
    '/trainers': 'Trainers',
    '/classes': 'Classes',
    '/attendance': 'Attendance',
    '/payments': 'Payments',
    '/settings': 'Settings',
    '/admin': 'Platform Overview',
    '/admin/gyms': 'Gym Partners',
    '/admin/plans': 'Plan Management',
    '/admin/subscriptions': 'Global Subscriptions',
    '/admin/settings': 'System Settings'
}

export function Header() {
    const location = useLocation()
    const navigate = useNavigate()
    const { isSuperAdmin } = useAuth()
    const title = pageTitles[location.pathname] || 'Dashboard'

    const [notifications, setNotifications] = useState<AppNotification[]>([])
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        loadNotifications()

        // Polling (every 30 seconds for new alerts)
        const interval = setInterval(loadNotifications, 30000)

        // Click outside to close
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            clearInterval(interval)
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isSuperAdmin])

    const loadNotifications = async () => {
        try {
            const data = await notificationService.getNotifications(isSuperAdmin)
            setNotifications(data)
        } catch (err) {
            console.error('Failed to load notifications:', err)
        }
    }

    const unreadCount = notifications.filter(n => !n.is_read).length

    const handleMarkAsRead = async (id: string, link?: string) => {
        await notificationService.markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        if (link) {
            navigate(link);
            setShowDropdown(false);
        }
    }

    const handleMarkAllAsRead = async () => {
        await notificationService.markAllAsRead(isSuperAdmin);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 size={16} color="#10b981" />;
            case 'warning': return <AlertTriangle size={16} color="#f59e0b" />;
            case 'error': return <XCircle size={16} color="#ef4444" />;
            default: return <Info size={16} color="#3b82f6" />;
        }
    }

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
                <div className={styles.notificationWrapper} ref={dropdownRef}>
                    <button
                        className={styles.notificationBtn}
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className={styles.notificationBadge}>{unreadCount}</span>
                        )}
                    </button>

                    {showDropdown && (
                        <div className={styles.dropdown}>
                            <div className={styles.dropdownHeader}>
                                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllAsRead} className={styles.markAllBtn}>
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            <div className={styles.notificationList}>
                                {notifications.length > 0 ? (
                                    notifications.map(n => (
                                        <div
                                            key={n.id}
                                            className={`${styles.notificationItem} ${!n.is_read ? styles.unread : ''}`}
                                            onClick={() => handleMarkAsRead(n.id, n.link)}
                                        >
                                            <div className={styles.notificationIcon}>
                                                {getIcon(n.type)}
                                            </div>
                                            <div className={styles.notificationBody}>
                                                <div className={styles.notificationTitle}>{n.title}</div>
                                                <div className={styles.notificationMsg}>{n.message}</div>
                                                <div className={styles.notificationTime}>
                                                    <Clock size={10} /> {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            {!n.is_read && <div className={styles.unreadDot} />}
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.emptyState}>No notifications yet</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
