import { useState, useEffect } from 'react'
import { Plus, Building2, Edit2, Trash2, Search } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { gymService, GymUI } from '../services/gymService'
import { useAuth } from '../contexts/AuthContext'
import { subscriptionService } from '../services/subscriptionService'
import styles from './MembersPage.module.css' // Reusing styles for now
import { showError, showConfirm } from '../utils/swal'

export function GymsPage() {
    const { user, isSuperAdmin } = useAuth()
    const [gyms, setGyms] = useState<GymUI[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    // Edit/Add State
    const [showModal, setShowModal] = useState(false)
    const [editingGym, setEditingGym] = useState<GymUI | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        contact_no: '',
        owner_name: '',
        gym_category: 'Unisex' as 'Unisex' | 'Only Men' | 'Only Women'
    })

    const fetchGyms = async () => {
        try {
            const data = await gymService.getGyms()
            setGyms(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGyms()
    }, [user])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingGym) {
                await gymService.updateGym(editingGym.id, {
                    name: formData.name,
                    location: formData.location,
                    contact_no: formData.contact_no,
                    owner_name: formData.owner_name,
                    gym_category: formData.gym_category
                })
            } else {
                if (!user) return

                // Check subscription limits before adding gym
                const canAdd = await subscriptionService.canAddGym(user.id)
                if (!canAdd.allowed) {
                    showError('Limit Reached', canAdd.reason || 'Cannot add gym location. Please upgrade your plan.')
                    return
                }

                await gymService.createGym({
                    name: formData.name,
                    location: formData.location,
                    contact_no: formData.contact_no,
                    owner_name: formData.owner_name,
                    gym_category: formData.gym_category,
                    owner_user_id: user.id
                })
            }
            setShowModal(false)
            fetchGyms()
        } catch (error: any) {
            showError('Error', error.message)
        }
    }

    const handleDelete = async (id: string) => {
        const result = await showConfirm('Delete Gym', 'Are you sure you want to delete this gym?')
        if (!result.isConfirmed) return

        try {
            await gymService.deleteGym(id)
            fetchGyms()
        } catch (e: any) {
            showError('Error', e.message || 'Failed to delete gym')
        }
    }

    const filteredGyms = gyms.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Gym Management</h1>
                    <p className={styles.subtitle}>
                        {isSuperAdmin ? 'Manage all registered gyms' : 'Manage your gym profile'}
                    </p>
                </div>
                {/* Allow all authenticated users to add gyms */}
                <Button onClick={() => {
                    setEditingGym(null)
                    setFormData({
                        name: '',
                        location: '',
                        contact_no: '',
                        owner_name: '',
                        gym_category: 'Unisex'
                    })
                    setShowModal(true)
                }}>
                    <Plus size={20} /> Add Gym
                </Button>
            </div>

            <div className={styles.filters}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search gyms..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Card padding="sm">
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Gym Name</th>
                            <th>Location</th>
                            <th>Contact No.</th>
                            <th>Owner</th>
                            <th>GYM Category</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} className="p-4 text-center">Loading...</td></tr>
                        ) : filteredGyms.length > 0 ? (
                            filteredGyms.map(gym => (
                                <tr key={gym.id}>
                                    <td>
                                        <div className={styles.memberCell}>
                                            <div className={styles.avatar} style={{ backgroundColor: '#6366f1' }}>
                                                <Building2 size={16} color="white" />
                                            </div>
                                            <span>{gym.name}</span>
                                        </div>
                                    </td>
                                    <td>{gym.location || 'Not specified'}</td>
                                    <td>{gym.contact_no || '-'}</td>
                                    <td>{gym.owner_name || '-'}</td>
                                    <td>
                                        <span className={styles.methodTag}>
                                            {gym.gym_category || 'Unisex'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={styles.statusBadge + ' ' + (gym.status === 'active' ? styles.statusActive : styles.statusInactive)}>
                                            {gym.status}
                                        </span>
                                    </td>
                                    <td>{gym.created_at}</td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className={styles.actionBtn}
                                                title="Edit"
                                                onClick={() => {
                                                    setEditingGym(gym)
                                                    setFormData({
                                                        name: gym.name,
                                                        location: gym.location || '',
                                                        contact_no: gym.contact_no || '',
                                                        owner_name: gym.owner_name || '',
                                                        gym_category: gym.gym_category || 'Unisex'
                                                    })
                                                    setShowModal(true)
                                                }}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            {/* Enable delete for all gym owners */}
                                            <button
                                                className={styles.actionBtn + ' ' + styles.deleteBtn}
                                                title="Delete"
                                                onClick={() => handleDelete(gym.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={8} className="p-4 text-center">No gyms found.</td></tr>
                        )}
                    </tbody>
                </table>
            </Card>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingGym ? 'Edit Gym' : 'Add New Gym'}
            >
                <form onSubmit={handleSave} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Gym Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Location</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            className={styles.input}
                            placeholder="e.g., Mumbai, Maharashtra"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Contact No.</label>
                        <input
                            type="tel"
                            value={formData.contact_no}
                            onChange={e => setFormData({ ...formData, contact_no: e.target.value })}
                            className={styles.input}
                            placeholder="e.g., +91 98765 43210"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Owner Name</label>
                        <input
                            type="text"
                            value={formData.owner_name}
                            onChange={e => setFormData({ ...formData, owner_name: e.target.value })}
                            className={styles.input}
                            placeholder="e.g., John Doe"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>GYM Category *</label>
                        <select
                            value={formData.gym_category}
                            onChange={e => setFormData({ ...formData, gym_category: e.target.value as 'Unisex' | 'Only Men' | 'Only Women' })}
                            className={styles.input}
                            required
                        >
                            <option value="Unisex">Unisex</option>
                            <option value="Only Men">Only Men</option>
                            <option value="Only Women">Only Women</option>
                        </select>
                    </div>
                    <div className={styles.modalActions}>
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit">{editingGym ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
