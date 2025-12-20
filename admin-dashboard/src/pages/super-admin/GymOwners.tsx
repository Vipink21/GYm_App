import { useState, useEffect } from 'react'
import { adminService, GymDetails } from '../../services/adminService'
import { Search, Trash2, Building2, MapPin, User, Mail, Phone } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { showError, showConfirm, showSuccess } from '../../utils/swal'

export function GymOwnersPage() {
    const [gyms, setGyms] = useState<GymDetails[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        loadGyms()
    }, [])

    const loadGyms = async () => {
        try {
            setLoading(true)
            const data = await adminService.getAllGyms()
            setGyms(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (gymId: string, gymName: string) => {
        const result = await showConfirm(
            'Delete Gym',
            `Are you sure you want to delete "${gymName}"? All data (members, subscriptions) will be lost.`
        )
        if (!result.isConfirmed) return

        try {
            await adminService.deleteGym(gymId)
            showSuccess('Deleted', 'Gym has been deleted successfully.')
            loadGyms()
        } catch (error: any) {
            showError('Error', 'Failed to delete gym: ' + error.message)
        }
    }

    // Filter logic
    const filteredGyms = gyms.filter(gym =>
        gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gym.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gym.city?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Gym Owners</h1>
                    <p style={{ color: '#64748b' }}>Manage all registered gyms and partners</p>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search
                        size={20}
                        color="#94a3b8"
                        style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <input
                        type="text"
                        placeholder="Search gym, email or city..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 40px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            <Card padding="sm">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.875rem' }}>Gym Details</th>
                                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.875rem' }}>Owner Info</th>
                                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.875rem' }}>Owner Location</th>
                                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.875rem' }}>Gym City Location</th>
                                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.875rem' }}>Plan</th>
                                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.875rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                            ) : filteredGyms.length > 0 ? (
                                filteredGyms.map(gym => {
                                    const activeSub = gym.subscription?.[0]
                                    return (
                                        <tr key={gym.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '8px', color: '#3b82f6' }}>
                                                        <Building2 size={20} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{gym.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{gym.type}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.9rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <User size={14} color="#64748b" /> {gym.owner?.display_name || 'N/A'}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Mail size={14} color="#64748b" /> {gym.owner?.email}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Phone size={14} color="#64748b" /> {gym.owner?.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.9rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <MapPin size={14} color="#64748b" /> {gym.owner?.city || 'N/A'}
                                                    </div>
                                                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '20px' }}>{gym.owner?.address || 'N/A'}</div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.9rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <MapPin size={14} color="#64748b" /> {gym.city || 'N/A'}
                                                    </div>
                                                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '20px' }}>{gym.location || 'N/A'}</div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {activeSub ? (
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600',
                                                        background: '#fef3c7',
                                                        color: '#b45309'
                                                    }}>
                                                        {activeSub.plan?.name}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>No Plan</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <button
                                                    onClick={() => handleDelete(gym.id, gym.name)}
                                                    style={{ padding: '8px', background: '#fee2e2', color: '#ef4444', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                                                    title="Delete Gym"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No gyms found matching your search.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
