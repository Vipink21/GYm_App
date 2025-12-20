import {
    Users,
    UserCheck,
    CreditCard,
    CalendarCheck,
    Activity,
    Bell,
    Calendar
} from 'lucide-react'
import { StatCard } from '../components/ui/StatCard'
import { Card, CardHeader } from '../components/ui/Card'
import styles from './DashboardPage.module.css'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { dashboardService } from '../services/dashboardService'
import { subscriptionService, Subscription, UsageStats } from '../services/subscriptionService'
import { SubscriptionBadge } from '../components/subscription/SubscriptionBadge'
import { UsageMeter } from '../components/subscription/UsageMeter'
import { Navigate, Link } from 'react-router-dom'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts'

export function DashboardPage() {
    const { user, userData, isSuperAdmin } = useAuth()
    const [subscription, setSubscription] = useState<Subscription | null>(null) // Fixed SubscriptionUI to Subscription
    const [usage, setUsage] = useState<UsageStats>({ memberCount: 0, trainerCount: 0, gymCount: 0 })
    const [loading, setLoading] = useState(true)

    if (isSuperAdmin) {
        return <Navigate to="/admin" replace />
    }

    const [stats, setStats] = useState<{ title: string, value: string, change: { value: number, type: 'increase' | 'decrease' }, icon: any, color: 'gold' | 'green' | 'blue' | 'purple' }[]>([
        { title: 'Total Members', value: '-', change: { value: 0, type: 'increase' as const }, icon: Users, color: 'gold' as const },
        { title: 'Active Trainers', value: '-', change: { value: 0, type: 'increase' as const }, icon: UserCheck, color: 'green' as const },
        { title: 'Revenue (Month)', value: '-', change: { value: 0, type: 'increase' as const }, icon: CreditCard, color: 'blue' as const },
        { title: 'Check-ins Today', value: '-', change: { value: 0, type: 'increase' as const }, icon: CalendarCheck, color: 'purple' as const },
    ])

    // Mock chart data
    const memberGrowthData = [
        { name: 'Mon', count: 12 },
        { name: 'Tue', count: 15 },
        { name: 'Wed', count: 10 },
        { name: 'Thu', count: 22 },
        { name: 'Fri', count: 30 },
        { name: 'Sat', count: 25 },
        { name: 'Sun', count: 18 },
    ]

    useEffect(() => {
        async function fetchAllData() {
            if (!user || !userData?.gymId) return
            try {
                const [dashStats, sub, usageData] = await Promise.all([
                    dashboardService.getStats(userData.gymId),
                    subscriptionService.getCurrentSubscription(userData.gymId),
                    subscriptionService.getUsageStats(userData.gymId)
                ])

                setStats([
                    { title: 'Total Members', value: dashStats.totalMembers.toString(), change: { value: 12, type: 'increase' }, icon: Users, color: 'gold' },
                    { title: 'Active Trainers', value: dashStats.activeTrainers.toString(), change: { value: 0, type: 'increase' }, icon: UserCheck, color: 'green' },
                    { title: 'Revenue (Month)', value: `₹${dashStats.monthlyRevenue.toLocaleString()}`, change: { value: 5, type: 'increase' }, icon: CreditCard, color: 'blue' },
                    { title: 'Check-ins Today', value: dashStats.checkInsToday.toString(), change: { value: 0, type: 'increase' }, icon: CalendarCheck, color: 'purple' },
                ])

                setSubscription(sub)
                setUsage(usageData)
            } catch (e) {
                console.error('Failed to load dashboard data:', e)
            } finally {
                setLoading(false)
            }
        }
        fetchAllData()
    }, [user, userData])

    const recentMembers = [
        { id: '1', name: 'Rahul Sharma', plan: 'Gold Annual', date: 'Dec 10, 2024' },
        { id: '2', name: 'Priya Patel', plan: 'Silver Monthly', date: 'Dec 10, 2024' },
        { id: '3', name: 'Amit Kumar', plan: 'Gold Annual', date: 'Dec 9, 2024' },
    ]

    const upcomingClasses = [
        { id: '1', name: 'Zumba Fitness', time: '05:00 PM', trainer: 'Sarah M.', room: 'Studio A' },
        { id: '2', name: 'Power Yoga', time: '06:30 PM', trainer: 'John D.', room: 'Studio B' },
        { id: '3', name: 'High Intensity', time: '07:30 PM', trainer: 'Mike T.', room: 'Main Hall' },
    ]

    const userRole = userData?.role || 'member'

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your dashboard...</div>
    }

    // --- GYM OWNER VIEW ---
    if (userRole === 'admin' || userRole === 'gym_owner') {
        return (
            <div className={styles.page}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800' }}>Gym Overview</h1>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Management dashboard for {userData?.gymId ? 'FitZone Partner' : 'Your Fitness Center'}</p>
                </div>

                <div className={styles.statsGrid}>
                    {stats.map((stat) => (
                        <StatCard key={stat.title} {...stat} />
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem', marginTop: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <Card>
                            <CardHeader title="New Members (Weekly)" />
                            <div style={{ height: '240px', width: '100%', marginTop: '1rem' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={memberGrowthData}>
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#eab308" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={11} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Area type="monotone" dataKey="count" stroke="#eab308" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <Card>
                                <CardHeader title="Quick Actions" />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    <Link to="/members" style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', textDecoration: 'none', color: '#1e293b' }}>
                                        <Users size={20} style={{ margin: '0 auto 8px', color: '#eab308' }} />
                                        <div style={{ fontSize: '0.75rem', fontWeight: '700' }}>Add Member</div>
                                    </Link>
                                    <Link to="/attendance" style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', textDecoration: 'none', color: '#1e293b' }}>
                                        <Activity size={20} style={{ margin: '0 auto 8px', color: '#3b82f6' }} />
                                        <div style={{ fontSize: '0.75rem', fontWeight: '700' }}>Check-in</div>
                                    </Link>
                                    <Link to="/payments" style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', textDecoration: 'none', color: '#1e293b' }}>
                                        <CreditCard size={20} style={{ margin: '0 auto 8px', color: '#10b981' }} />
                                        <div style={{ fontSize: '0.75rem', fontWeight: '700' }}>Collect Fee</div>
                                    </Link>
                                    <Link to="/settings" style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', textDecoration: 'none', color: '#1e293b' }}>
                                        <Bell size={20} style={{ margin: '0 auto 8px', color: '#f43f5e' }} />
                                        <div style={{ fontSize: '0.75rem', fontWeight: '700' }}>Announce</div>
                                    </Link>
                                </div>
                            </Card>

                            <Card>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '0.9rem' }}>Recent Joining</h3>
                                    <Link to="/members" style={{ fontSize: '0.75rem', color: '#eab308', fontWeight: '600' }}>View More</Link>
                                </div>
                                <div className={styles.list}>
                                    {recentMembers.map((member) => (
                                        <div key={member.id} className={styles.listItem} style={{ padding: '8px 0' }}>
                                            <div className={styles.avatar} style={{ width: '32px', height: '32px', fontSize: '12px' }}>{member.name.charAt(0)}</div>
                                            <div className={styles.listContent}>
                                                <span className={styles.listTitle} style={{ fontSize: '0.85rem' }}>{member.name}</span>
                                                <span className={styles.listSubtitle} style={{ fontSize: '0.7rem' }}>{member.plan}</span>
                                            </div>
                                            <span className={styles.listDate} style={{ fontSize: '0.7rem' }}>{member.date}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {subscription && (
                            <Card className={styles.premiumCard}>
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>My Subscription</span>
                                        <SubscriptionBadge planName={subscription.plan.name} status={subscription.status} />
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', margin: '0.5rem 0', color: 'white' }}>{subscription.plan.name} Plan</h3>
                                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <UsageMeter used={usage.memberCount} limit={subscription.plan.max_members_per_gym} label="Members Used" />
                                        <UsageMeter used={usage.trainerCount} limit={subscription.plan.max_trainers_per_gym} label="Trainers Used" />
                                    </div>
                                    <Link to="/plans" style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', textDecoration: 'none', fontSize: '0.85rem' }}>
                                        Upgrade / Manage Plan
                                    </Link>
                                </div>
                            </Card>
                        )}

                        <Card>
                            <CardHeader title="Classes Today" />
                            <div style={{ padding: '0 1rem 1rem' }}>
                                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {upcomingClasses.map(cls => (
                                        <div key={cls.id} style={{ display: 'flex', gap: '12px', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                                            <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '8px', textAlign: 'center', minWidth: '60px' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#3b82f6' }}>{cls.time.split(' ')[0]}</div>
                                                <div style={{ fontSize: '0.6rem', color: '#64748b' }}>{cls.time.split(' ')[1]}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{cls.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>with {cls.trainer} • {cls.room}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    // --- TRAINER VIEW ---
    if (userRole === 'trainer') {
        return (
            <div className={styles.page}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800' }}>Trainer Hub</h1>
                    <p style={{ color: '#64748b' }}>Manage your sessions and member performance.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <StatCard title="Assignees" value="24" icon={Users} color="gold" />
                    <StatCard title="Today's Classes" value="3" icon={Calendar} color="blue" />
                    <StatCard title="Active Streak" value="12 Days" icon={Activity} color="green" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                    <Card>
                        <CardHeader title="My Class Schedule" />
                        <div style={{ padding: '0 1.25rem 1.25rem' }}>
                            <div style={{ marginTop: '1rem' }}>
                                {upcomingClasses.slice(0, 2).map(cls => (
                                    <div key={cls.id} style={{ padding: '1.25rem', border: '1px solid #f1f5f9', borderRadius: '12px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{cls.name}</h4>
                                            <p style={{ margin: '0.25rem 0', color: '#64748b', fontSize: '0.9rem' }}>{cls.time} • {cls.room}</p>
                                        </div>
                                        <Link to="/attendance" style={{ padding: '0.5rem 1rem', background: '#eab308', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '0.8rem' }}>Mark Attendance</Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <CardHeader title="Notes & Alerts" />
                        <div style={{ padding: '0 1.25rem 1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                            <div style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>📌 Member Rahul Sharma reached goal weight.</div>
                            <div style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>⚠️ Gym holiday on Friday.</div>
                        </div>
                    </Card>
                </div>
            </div>
        )
    }

    // --- MEMBER VIEW (DEFAULT) ---
    return (
        <div className={styles.page}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800' }}>Welcome, {userData?.profile?.firstName || 'Member'}!</h1>
                    <p style={{ color: '#64748b' }}>You have 15 days left in your Gold Plan.</p>
                </div>
                <Link to="/payments" style={{ padding: '0.75rem 1.5rem', background: '#1e293b', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: '700' }}>Renew Now</Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Card>
                        <CardHeader title="My Attendance History" />
                        <div style={{ padding: '0 1rem 1rem' }}>
                            <div style={{ height: '300px', width: '100%', marginTop: '1rem' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={memberGrowthData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis hide />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} />
                                        <Bar dataKey="count" fill="#eab308" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>Visits per day last week</p>
                        </div>
                    </Card>

                    <Card>
                        <CardHeader title="Available Classes" />
                        <div style={{ padding: '0 1rem 1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                {upcomingClasses.map(cls => (
                                    <div key={cls.id} style={{ padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#eab308', fontWeight: '800' }}>{cls.time}</div>
                                        <div style={{ fontWeight: '700', margin: '0.25rem 0' }}>{cls.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{cls.room}</div>
                                        <button style={{ marginTop: '0.75rem', width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', fontWeight: '600', fontSize: '0.75rem' }}>Book Spot</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Card className={styles.premiumCard}>
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ margin: 0, color: 'white' }}>Active Membership</h3>
                            <p style={{ fontSize: '2rem', fontWeight: '800', margin: '1rem 0', color: 'white' }}>Gold Annual</p>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Valid until Dec 31, 2025</div>
                            <div style={{ marginTop: '1.5rem', padding: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white' }}>
                                Next Payment: ₹12,000
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <CardHeader title="Your Stats" />
                        <div style={{ padding: '0 1.5rem 1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Total Visits</span>
                                    <span style={{ fontWeight: '800' }}>142</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>PT Sessions Left</span>
                                    <span style={{ fontWeight: '800' }}>4</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
