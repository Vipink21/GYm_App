import { Building2, Users, CreditCard, Crown } from 'lucide-react'

export function SuperAdminDashboard() {
    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '2rem' }}>Super Admin Overview</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {/* Stat 1 */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', borderRadius: '50%', background: '#eff6ff', color: '#3b82f6' }}>
                            <Building2 size={24} />
                        </div>
                        <span style={{ color: '#64748b' }}>Total Gyms</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>1</div>
                </div>

                {/* Stat 2 */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', borderRadius: '50%', background: '#f0fdf4', color: '#22c55e' }}>
                            <CreditCard size={24} />
                        </div>
                        <span style={{ color: '#64748b' }}>Revenue</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹0</div>
                </div>

                {/* Stat 3 */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', borderRadius: '50%', background: '#fff7ed', color: '#ea580c' }}>
                            <Crown size={24} />
                        </div>
                        <span style={{ color: '#64748b' }}>Active Plans</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>All</div>
                </div>
            </div>
        </div>
    )
}
