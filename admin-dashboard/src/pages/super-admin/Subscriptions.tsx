import { useState, useEffect } from 'react'
import { adminRevenueService, PaymentTransaction } from '../../services/adminRevenueService'
import { Card } from '../../components/ui/Card'
import { Loader2, CreditCard, Filter, Download, ExternalLink, ArrowUpRight, ArrowDownRight, Building2 } from 'lucide-react'

export function SubscriptionsPage() {
    const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const data = await adminRevenueService.getAllTransactions()
            setTransactions(data)
        } catch (error) {
            console.error('Failed to load transactions:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredTransactions = transactions.filter(t =>
        filter === 'all' || t.status === filter
    )

    if (loading) {
        return (
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader2 className="animate-spin" size={40} color="#eab308" />
            </div>
        )
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Global Subscriptions</h1>
                    <p style={{ color: '#64748b' }}>Monitor platform health and transaction history.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={{
                        padding: '10px 16px',
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}>
                        <Download size={18} /> Export CSV
                    </button>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{
                            padding: '10px 16px',
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            outline: 'none',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}
                    >
                        <option value="all">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue (This Month)</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{transactions.filter(t => t.status === 'completed').reduce((s, t) => s + Number(t.amount), 0).toLocaleString()}</h3>
                        <span style={{ fontSize: '0.8rem', color: '#10b981', background: '#d1fae5', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <ArrowUpRight size={12} /> 12%
                        </span>
                    </div>
                </div>
                {/* Add more mini-stats here if needed */}
            </div>

            <Card padding="sm">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>TRANSACTION ID</th>
                                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>GYM PARTNER</th>
                                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>PLAN</th>
                                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>AMOUNT</th>
                                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>DATE</th>
                                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map(tx => (
                                    <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#64748b', fontFamily: 'monospace' }}>#{tx.id.slice(0, 8)}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '32px', height: '32px', background: '#e0e7ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338ca' }}>
                                                    <Building2 size={16} />
                                                </div>
                                                <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{tx.gym?.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.95rem' }}>{tx.plan?.name}</td>
                                        <td style={{ padding: '1rem', fontWeight: 'bold', fontSize: '1rem' }}>₹{Number(tx.amount).toLocaleString()}</td>
                                        <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>{new Date(tx.created_at).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                background: tx.status === 'completed' ? '#d1fae5' : tx.status === 'failed' ? '#fee2e2' : '#fef3c7',
                                                color: tx.status === 'completed' ? '#065f46' : tx.status === 'failed' ? '#991b1b' : '#92400e'
                                            }}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                        No transactions found matching your filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
