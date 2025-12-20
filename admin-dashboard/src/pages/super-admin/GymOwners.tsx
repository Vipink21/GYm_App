import { useState, useEffect } from 'react'
import { adminService, GymDetails } from '../../services/adminService'
import { auditService } from '../../services/auditService'
import { Search, Trash2, Building2, MapPin, User, Mail, Phone } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { showError, showConfirm, showSuccess } from '../../utils/swal'
import styles from './GymOwners.module.css'

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
            await auditService.logAction('delete', 'gym', gymId, { name: gymName })
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
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Gym Partners</h1>
                    <p className={styles.subtitle}>Manage all registered gyms and platform partners</p>
                </div>

                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <Search size={20} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search gym, email or city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </div>
            </div>

            <Card padding="none">
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Gym Details</th>
                                <th>Owner Info</th>
                                <th>Owner Location</th>
                                <th>Gym Location</th>
                                <th>Plan</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className={styles.empty}>Loading partners...</td></tr>
                            ) : filteredGyms.length > 0 ? (
                                filteredGyms.map(gym => {
                                    return (
                                        <tr key={gym.id}>
                                            <td>
                                                <div className={styles.gymCell}>
                                                    <div className={styles.iconBox}>
                                                        <Building2 size={24} />
                                                    </div>
                                                    <div>
                                                        <div className={styles.gymName}>{gym.name}</div>
                                                        <div className={styles.gymType}>{gym.type}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.contactInfo}>
                                                    <div className={styles.contactItem}>
                                                        <User size={14} /> {gym.owner?.display_name || 'N/A'}
                                                    </div>
                                                    <div className={styles.contactItem}>
                                                        <Mail size={14} /> {gym.owner?.email}
                                                    </div>
                                                    <div className={styles.contactItem}>
                                                        <Phone size={14} /> {gym.owner?.phone || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.locationInfo}>
                                                    <div className={styles.locationMain}>
                                                        <MapPin size={14} /> {gym.owner?.city || 'N/A'}
                                                    </div>
                                                    <div className={styles.locationSub}>{gym.owner?.address || 'N/A'}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.locationInfo}>
                                                    <div className={styles.locationMain}>
                                                        <MapPin size={14} /> {gym.city || 'N/A'}
                                                    </div>
                                                    <div className={styles.locationSub}>{gym.location || 'N/A'}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={styles.planBadge}>
                                                    {gym.subscription?.[0]?.plan?.name || 'Free Tier'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleDelete(gym.id, gym.name)}
                                                    className={styles.deleteBtn}
                                                    title="Delete Gym"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr><td colSpan={6} className={styles.empty}>No gyms found matching your search.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}

