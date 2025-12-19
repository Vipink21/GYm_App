import { useState, useEffect } from 'react'
import { Plus, Edit2, History, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { planManagementService, Plan } from '../services/planManagementService'
import { useAuth } from '../contexts/AuthContext'
import styles from './MembersPage.module.css'
import { showError, showConfirm, showSuccess } from '../utils/swal'

export function PlanManagementPage() {
    const { isSuperAdmin } = useAuth()
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price_monthly: 0,
        price_yearly: 0,
        max_gyms: 1,
        max_members_per_gym: null as number | null,
        max_trainers_per_gym: null as number | null,
        features: [] as string[],
        is_active: true
    })

    useEffect(() => {
        if (!isSuperAdmin) return
        fetchPlans()
    }, [isSuperAdmin])

    const fetchPlans = async () => {
        try {
            const data = await planManagementService.getAllPlans()
            setPlans(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingPlan) {
                await planManagementService.updatePlan(editingPlan.id, formData)
            } else {
                await planManagementService.createPlan(formData as any)
            }
            setShowModal(false)
            showSuccess('Plan Saved', editingPlan ? 'Plan has been updated successfully.' : 'New plan has been created successfully.')
            fetchPlans()
        } catch (error: any) {
            showError('Error', error.message)
        }
    }

    const handleToggleStatus = async (planId: string, currentStatus: boolean) => {
        try {
            await planManagementService.togglePlanStatus(planId, !currentStatus)
            fetchPlans()
        } catch (error) {
            console.error(error)
        }
    }

    const handleDelete = async (planId: string) => {
        const result = await showConfirm(
            'Delete Plan',
            'Are you sure you want to delete this plan? This action cannot be undone.'
        )
        if (!result.isConfirmed) return

        try {
            await planManagementService.deletePlan(planId)
            showSuccess('Deleted', 'Plan has been deleted successfully.')
            fetchPlans()
        } catch (error: any) {
            if (error?.code === '23503') {
                showError('Cannot Delete', 'This plan has active subscriptions. Deactivate it instead to prevent new signups.')
            } else {
                showError('Error', 'Failed to delete plan: ' + error.message)
            }
        }
    }

    if (!isSuperAdmin) {
        return <div className={styles.page}>Access Denied. Super Admin only.</div>
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Subscription Plan Management</h1>
                    <p className={styles.subtitle}>Manage pricing and features for all subscription tiers</p>
                </div>
                <Button onClick={() => {
                    setEditingPlan(null)
                    setFormData({
                        name: '',
                        description: '',
                        price_monthly: 0,
                        price_yearly: 0,
                        max_gyms: 1,
                        max_members_per_gym: null,
                        max_trainers_per_gym: null,
                        features: [],
                        is_active: true
                    })
                    setShowModal(true)
                }}>
                    <Plus size={20} /> Add New Plan
                </Button>
            </div>

            <Card padding="sm">
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Plan Name</th>
                            <th>Monthly Price</th>
                            <th>Yearly Price</th>
                            <th>Max Members</th>
                            <th>Max Trainers</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="p-4 text-center">Loading...</td></tr>
                        ) : plans.length > 0 ? (
                            plans.map(plan => (
                                <tr key={plan.id}>
                                    <td><strong>{plan.name}</strong></td>
                                    <td>₹{plan.price_monthly}</td>
                                    <td>₹{plan.price_yearly}</td>
                                    <td>{plan.max_members_per_gym || '∞'}</td>
                                    <td>{plan.max_trainers_per_gym || '∞'}</td>
                                    <td>
                                        <button
                                            className={styles.actionBtn}
                                            onClick={() => handleToggleStatus(plan.id, plan.is_active)}
                                            title={plan.is_active ? 'Deactivate' : 'Activate'}
                                        >
                                            {plan.is_active ? (
                                                <ToggleRight size={20} color="green" />
                                            ) : (
                                                <ToggleLeft size={20} color="gray" />
                                            )}
                                        </button>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => {
                                                    setEditingPlan(plan)
                                                    setFormData({
                                                        name: plan.name,
                                                        description: plan.description,
                                                        price_monthly: plan.price_monthly,
                                                        price_yearly: plan.price_yearly,
                                                        max_gyms: plan.max_gyms,
                                                        max_members_per_gym: plan.max_members_per_gym,
                                                        max_trainers_per_gym: plan.max_trainers_per_gym,
                                                        features: plan.features,
                                                        is_active: plan.is_active
                                                    })
                                                    setShowModal(true)
                                                }}
                                                title="Edit Plan"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className={styles.actionBtn}
                                                title="View Change History"
                                            >
                                                <History size={16} />
                                            </button>
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => handleDelete(plan.id)}
                                                title="Delete Plan"
                                                style={{ color: '#ef4444' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={7} className="p-4 text-center">No plans found.</td></tr>
                        )}
                    </tbody>
                </table>
            </Card>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingPlan ? 'Edit Plan' : 'Create New Plan'}
            >
                <form onSubmit={handleSave} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Plan Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className={styles.input}
                            placeholder="e.g., Pro"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className={styles.input}
                            rows={2}
                            placeholder="Plan description"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className={styles.formGroup}>
                            <label>Monthly Price (₹) *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.price_monthly}
                                onChange={e => setFormData({ ...formData, price_monthly: Number(e.target.value) })}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Yearly Price (₹)</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.price_yearly}
                                onChange={e => setFormData({ ...formData, price_yearly: Number(e.target.value) })}
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div className={styles.formGroup}>
                            <label>Max Gyms</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.max_gyms}
                                onChange={e => setFormData({ ...formData, max_gyms: Number(e.target.value) })}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Max Members</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.max_members_per_gym || ''}
                                onChange={e => setFormData({ ...formData, max_members_per_gym: e.target.value ? Number(e.target.value) : null })}
                                className={styles.input}
                                placeholder="Leave empty for unlimited"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Max Trainers</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.max_trainers_per_gym || ''}
                                onChange={e => setFormData({ ...formData, max_trainers_per_gym: e.target.value ? Number(e.target.value) : null })}
                                className={styles.input}
                                placeholder="Leave empty for unlimited"
                            />
                        </div>
                    </div>

                    <div className={styles.modalActions}>
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit">{editingPlan ? 'Update Plan' : 'Create Plan'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
