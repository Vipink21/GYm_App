import { useState, useEffect } from 'react'
import { Building2, CreditCard, Crown, Loader2, MapPin, User, ExternalLink } from 'lucide-react'
import { adminService, GymDetails } from '../../services/adminService'
import { planManagementService } from '../../services/planManagementService'
import { Card } from '../../components/ui/Card'
import { Link } from 'react-router-dom'

export function SuperAdminDashboard() {
    const [stats, setStats] = useState({
        totalGyms: 0,
        revenue: 0,
        activePlans: 0
    })
    const [recentGyms, setRecentGyms] = useState<GymDetails[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadStats() {
            try {
                const [gyms, plans] = await Promise.all([
                    adminService.getAllGyms(),
                    planManagementService.getAllPlans()
                ])

                setStats({
                    totalGyms: gyms.length,
                    revenue: 0, // In a real app, calculate from payments
                    activePlans: plans.filter(p => p.is_active).length
                })
                setRecentGyms(gyms.slice(0, 5)) // Get latest 5
            } catch (error) {
                console.error('Failed to load dashboard stats:', error)
            } finally {
                setLoading(false)
            }
        }
        loadStats()
    }, [])

    if (loading) {
        return (
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader2 className="animate-spin" size={40} color="#eab308" />
            </div>
        )
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Super Admin Overview</h1>
                <p style={{ color: '#64748b' }}>Real-time platform statistics</p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Gyms Stat */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Total Gyms</p>
                            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{stats.totalGyms}</h3>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#eff6ff', color: '#3b82f6' }}>
                            <Building2 size={24} />
                        </div>
                    </div>
                </div>

                {/* Revenue Stat */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Platform Revenue</p>
                            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>₹{stats.revenue}</h3>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#f0fdf4', color: '#22c55e' }}>
                            <CreditCard size={24} />
                        </div>
                    </div>
                </div>

                {/* Plans Stat */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Active Plans</p>
                            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{stats.activePlans}</h3>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#fff7ed', color: '#ea580c' }}>
                            <Crown size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Gyms Table */}
            <div style={{ marginTop: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Recent Gym Partners</h2>
                    <Link to="/admin/gyms" style={{ color: '#eab308', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        View All <ExternalLink size={16} />
                    </Link>
                </div>

                <Card padding="sm">
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <tr>
                                    <th style={{ padding: '1rem', color: '#475569', fontSize: '0.875rem' }}>Gym Name</th>
                                    <th style={{ padding: '1rem', color: '#475569', fontSize: '0.875rem' }}>Owner</th>
                                    <th style={{ padding: '1rem', color: '#475569', fontSize: '0.875rem' }}>Location</th>
                                    <th style={{ padding: '1rem', color: '#475569', fontSize: '0.875rem' }}>Plan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentGyms.length > 0 ? (
                                    recentGyms.map(gym => (
                                        <tr key={gym.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: '600', color: '#1e293b' }}>{gym.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{gym.type}</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                                                    <User size={14} color="#64748b" /> {gym.owner?.display_name || 'N/A'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                                                    <MapPin size={14} color="#64748b" /> {gym.city}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.8rem',
                                                    background: '#fef3c7',
                                                    color: '#b45309',
                                                    fontWeight: '600'
                                                }}>
                                                    {gym.subscription?.[0]?.plan?.name || 'Free'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                                            No recent gym registrations.
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
