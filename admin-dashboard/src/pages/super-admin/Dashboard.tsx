import { useState, useEffect } from 'react'
import { Building2, CreditCard, Crown, Loader2, MapPin, ExternalLink, Users, TrendingUp, Tag } from 'lucide-react'
import { adminService, GymDetails } from '../../services/adminService'
import { Card, CardHeader } from '../../components/ui/Card'
import { Link } from 'react-router-dom'
import { adminRevenueService } from '../../services/adminRevenueService'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts'

export function SuperAdminDashboard() {
    const [stats, setStats] = useState({
        totalGyms: 0,
        revenue: 0,
        activeSubs: 0,
        totalEndUsers: 0
    })
    const [recentGyms, setRecentGyms] = useState<GymDetails[]>([])
    const [revenueTrend, setRevenueTrend] = useState<any[]>([])
    const [activityTrend, setActivityTrend] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadStats() {
            try {
                const [gyms, revStats, userCount, revTrend, actTrend] = await Promise.all([
                    adminService.getAllGyms(),
                    adminRevenueService.getStats(),
                    adminService.getTotalUserCount(),
                    adminRevenueService.getRevenueTrend(),
                    adminService.getPlatformActivityTrend()
                ])

                console.log('🎯 DASHBOARD: Received gyms data:', gyms)
                console.log('🎯 DASHBOARD: Gyms with subscription details:', gyms.map(g => ({
                    name: g.name,
                    subscription_count: g.subscription?.length || 0,
                    first_subscription: g.subscription?.[0],
                    plan_name: g.subscription?.[0]?.plan?.name || 'NO PLAN'
                })))

                setStats({
                    totalGyms: gyms.length,
                    revenue: revStats.totalRevenue,
                    activeSubs: revStats.activeSubscriptions,
                    totalEndUsers: userCount
                })
                setRecentGyms(gyms.slice(0, 5))
                setRevenueTrend(revTrend)
                setActivityTrend(actTrend)
            } catch (error) {
                console.error('Failed to load dashboard stats:', error)
            } finally {
                setLoading(false)
            }
        }
        loadStats()
    }, [])

    // Helper function to get plan badge styling
    const getPlanBadgeStyle = (planName: string) => {
        const name = planName?.toLowerCase() || 'free'

        if (name.includes('enterprise') || name.includes('premium')) {
            return {
                background: '#f3e8ff',
                color: '#7c3aed',
                border: '1px solid #c4b5fd'
            }
        } else if (name.includes('professional') || name.includes('pro')) {
            return {
                background: '#dbeafe',
                color: '#1d4ed8',
                border: '1px solid #93c5fd'
            }
        } else if (name.includes('starter') || name.includes('basic')) {
            return {
                background: '#d1fae5',
                color: '#059669',
                border: '1px solid #6ee7b7'
            }
        } else {
            // Free Tier
            return {
                background: '#fef3c7',
                color: '#92400e',
                border: '1px solid #fde68a'
            }
        }
    }

    if (loading) {
        return (
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader2 className="animate-spin" size={40} color="#eab308" />
            </div>
        )
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>Platform Overview</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Welcome back, Master Admin. Here is what's happening today.</p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <Card padding="md">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Active Gyms</p>
                            <h3 style={{ fontSize: '1.875rem', fontWeight: '800', margin: '0.5rem 0' }}>{stats.totalGyms}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#10b981' }}>
                                <TrendingUp size={14} /> +12% this month
                            </div>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#eff6ff', color: '#3b82f6', height: 'fit-content' }}>
                            <Building2 size={24} />
                        </div>
                    </div>
                </Card>

                <Card padding="md">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Platform Revenue</p>
                            <h3 style={{ fontSize: '1.875rem', fontWeight: '800', margin: '0.5rem 0' }}>₹{stats.revenue.toLocaleString()}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#10b981' }}>
                                <TrendingUp size={14} /> +8.5% growth
                            </div>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#f0fdf4', color: '#22c55e', height: 'fit-content' }}>
                            <CreditCard size={24} />
                        </div>
                    </div>
                </Card>

                <Card padding="md">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Active Subscriptions</p>
                            <h3 style={{ fontSize: '1.875rem', fontWeight: '800', margin: '0.5rem 0' }}>{stats.activeSubs}</h3>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Across all regions</div>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#fff7ed', color: '#ea580c', height: 'fit-content' }}>
                            <Crown size={24} />
                        </div>
                    </div>
                </Card>

                <Card padding="md">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Total End-Users</p>
                            <h3 style={{ fontSize: '1.875rem', fontWeight: '800', margin: '0.5rem 0' }}>{stats.totalEndUsers.toLocaleString()}</h3>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Active members</div>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#faf5ff', color: '#a855f7', height: 'fit-content' }}>
                            <Users size={24} />
                        </div>
                    </div>
                </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <Card>
                    <CardHeader title="Revenue Trend (INR)" />
                    <div style={{ height: '300px', width: '100%', marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueTrend}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#eab308" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card>
                    <CardHeader title="Platform User Activity" />
                    <div style={{ height: '300px', width: '100%', marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activityTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Bar dataKey="users" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Recent Gyms Table */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Recent Gym Partners</h2>
                    <Link to="/admin/gyms" style={{ color: '#eab308', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Manage All Partners <ExternalLink size={16} />
                    </Link>
                </div>

                <Card padding="none">
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <th style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Gym Name</th>
                                    <th style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Owner Details</th>
                                    <th style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Location</th>
                                    <th style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Plan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentGyms.length > 0 ? (
                                    recentGyms.map(gym => (
                                        <tr key={gym.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ fontWeight: '700', color: '#1e293b' }}>{gym.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{gym.type}</div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#475569' }}>
                                                    <div style={{ width: '24px', height: '24px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                                                        {gym.owner?.display_name?.charAt(0) || 'U'}
                                                    </div>
                                                    {gym.owner?.display_name || 'Anonymous User'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#64748b' }}>
                                                    <MapPin size={14} /> {gym.city || 'Not Specified'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                {(() => {
                                                    const planName = gym.subscription?.[0]?.plan?.name || 'Free Tier'
                                                    const badgeStyle = getPlanBadgeStyle(planName)
                                                    return (
                                                        <span style={{
                                                            padding: '6px 12px',
                                                            borderRadius: '20px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '700',
                                                            ...badgeStyle
                                                        }}>
                                                            {planName}
                                                        </span>
                                                    )
                                                })()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                                            No recent registration data available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    )
}
