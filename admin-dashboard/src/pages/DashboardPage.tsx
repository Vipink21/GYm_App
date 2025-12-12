import { Users, UserCheck, CreditCard, CalendarCheck } from 'lucide-react'
import { StatCard } from '../components/ui/StatCard'
import { Card, CardHeader } from '../components/ui/Card'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
    // In production, these would come from Firebase queries
    const stats = [
        { title: 'Total Members', value: '1,247', change: { value: 12.5, type: 'increase' as const }, icon: Users, color: 'gold' as const },
        { title: 'Active Trainers', value: '24', change: { value: 4.2, type: 'increase' as const }, icon: UserCheck, color: 'green' as const },
        { title: 'Revenue (Month)', value: '₹4.8L', change: { value: 8.1, type: 'increase' as const }, icon: CreditCard, color: 'blue' as const },
        { title: 'Check-ins Today', value: '156', change: { value: 2.3, type: 'decrease' as const }, icon: CalendarCheck, color: 'purple' as const },
    ]

    const recentMembers = [
        { id: '1', name: 'Rahul Sharma', plan: 'Gold Annual', date: 'Dec 10, 2024' },
        { id: '2', name: 'Priya Patel', plan: 'Silver Monthly', date: 'Dec 10, 2024' },
        { id: '3', name: 'Amit Kumar', plan: 'Gold Annual', date: 'Dec 9, 2024' },
        { id: '4', name: 'Sneha Gupta', plan: 'Platinum', date: 'Dec 8, 2024' },
    ]

    const expiringMemberships = [
        { id: '1', name: 'Vikram Singh', daysLeft: 3, plan: 'Gold' },
        { id: '2', name: 'Anita Desai', daysLeft: 5, plan: 'Silver' },
        { id: '3', name: 'Rajesh Nair', daysLeft: 7, plan: 'Gold' },
    ]

    return (
        <div className={styles.page}>
            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                {stats.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            {/* Content Grid */}
            <div className={styles.contentGrid}>
                {/* Recent Members */}
                <Card>
                    <CardHeader title="Recent Members" />
                    <div className={styles.list}>
                        {recentMembers.map((member) => (
                            <div key={member.id} className={styles.listItem}>
                                <div className={styles.avatar}>{member.name.charAt(0)}</div>
                                <div className={styles.listContent}>
                                    <span className={styles.listTitle}>{member.name}</span>
                                    <span className={styles.listSubtitle}>{member.plan}</span>
                                </div>
                                <span className={styles.listDate}>{member.date}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Expiring Memberships */}
                <Card>
                    <CardHeader title="Expiring Soon" />
                    <div className={styles.list}>
                        {expiringMemberships.map((item) => (
                            <div key={item.id} className={styles.listItem}>
                                <div className={styles.avatar}>{item.name.charAt(0)}</div>
                                <div className={styles.listContent}>
                                    <span className={styles.listTitle}>{item.name}</span>
                                    <span className={styles.listSubtitle}>{item.plan} Plan</span>
                                </div>
                                <span className={`${styles.badge} ${item.daysLeft <= 3 ? styles.badgeUrgent : styles.badgeWarning}`}>
                                    {item.daysLeft} days
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}
