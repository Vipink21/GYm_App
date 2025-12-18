import { Users, UserCheck, CreditCard, CalendarCheck } from 'lucide-react'
import { StatCard } from '../components/ui/StatCard'
import { Card, CardHeader } from '../components/ui/Card'
import styles from './DashboardPage.module.css'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { dashboardService } from '../services/dashboardService'
import { subscriptionService, Subscription, UsageStats } from '../services/subscriptionService'
import { SubscriptionBadge } from '../components/subscription/SubscriptionBadge'
import { UsageMeter } from '../components/subscription/UsageMeter'
import { Navigate } from 'react-router-dom'

export function DashboardPage() {
    const { user, userData, isSuperAdmin } = useAuth()

    if (isSuperAdmin) {
        return <Navigate to="/admin" replace />
    }
    const [subscription, setSubscription] = useState<Subscription | null>(null)
    const [usage, setUsage] = useState<UsageStats>({ memberCount: 0, trainerCount: 0, gymCount: 0 })
    // In production, these would come from Firebase queries
    const [stats, setStats] = useState([
        { title: 'Total Members', value: '-', change: { value: 0, type: 'increase' as const }, icon: Users, color: 'gold' as const },
        { title: 'Active Trainers', value: '-', change: { value: 0, type: 'increase' as const }, icon: UserCheck, color: 'green' as const },
        { title: 'Revenue (Month)', value: '-', change: { value: 0, type: 'increase' as const }, icon: CreditCard, color: 'blue' as const },
        { title: 'Check-ins Today', value: '-', change: { value: 0, type: 'decrease' as const }, icon: CalendarCheck, color: 'purple' as const },
    ])

    useEffect(() => {
        async function fetchStats() {
            if (!user) return
            try {
                const gymId = user.user_metadata?.gym_id || user.id
                const data = await dashboardService.getStats(gymId)

                setStats([
                    { title: 'Total Members', value: data.totalMembers.toString(), change: { value: 12.5, type: 'increase' as const }, icon: Users, color: 'gold' as const },
                    { title: 'Active Trainers', value: data.activeTrainers.toString(), change: { value: 4.2, type: 'increase' as const }, icon: UserCheck, color: 'green' as const },
                    { title: 'Revenue (Month)', value: `₹${(data.monthlyRevenue / 100000).toFixed(1)}L`, change: { value: 8.1, type: 'increase' as const }, icon: CreditCard, color: 'blue' as const },
                    { title: 'Check-ins Today', value: data.checkInsToday.toString(), change: { value: 0, type: 'decrease' as const }, icon: CalendarCheck, color: 'purple' as const },
                ])
            } catch (e) { console.error(e) }
        }
        fetchStats()
    }, [user])

    useEffect(() => {
        async function fetchSubscription() {
            if (!userData?.gymId) return
            try {
                const sub = await subscriptionService.getCurrentSubscription(userData.gymId)
                setSubscription(sub)

                const usageData = await subscriptionService.getUsageStats(userData.gymId)
                setUsage(usageData)
            } catch (e) { console.error(e) }
        }
        fetchSubscription()
    }, [userData])

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

            {/* Subscription Status Widget */}
            {subscription && (
                <Card style={{ marginTop: '2rem' }}>
                    <div style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Your Subscription</h3>
                            <SubscriptionBadge
                                planName={subscription.plan.name}
                                status={subscription.status}
                                trialDaysLeft={subscriptionService.getDaysRemainingInTrial(subscription)}
                            />
                        </div>

                        {subscriptionService.isTrialEndingSoon(subscription) && (
                            <div style={{
                                padding: '0.75rem',
                                background: '#fef3c7',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                fontSize: '0.875rem'
                            }}>
                                ⚠️ Your trial ends in {subscriptionService.getDaysRemainingInTrial(subscription)} days.
                                <a href="/plans" style={{ marginLeft: '0.5rem', textDecoration: 'underline' }}>Upgrade now</a>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                            <UsageMeter
                                used={usage.memberCount}
                                limit={subscription.plan.max_members_per_gym}
                                label="Members"
                            />
                            <UsageMeter
                                used={usage.trainerCount}
                                limit={subscription.plan.max_trainers_per_gym}
                                label="Trainers"
                            />
                            <UsageMeter
                                used={usage.gymCount}
                                limit={subscription.plan.max_gyms}
                                label="Gym Locations"
                            />
                        </div>
                    </div>
                </Card>
            )}

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
