import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { showError, showSuccess } from '../utils/swal'
import styles from './PlansPage.module.css'

interface MembershipPlan {
    id: string
    gym_id: string
    name: string
    description: string
    duration_months: number
    price: number
    features: string[]
    is_active: boolean
    created_at: string
}

export function MembershipPlansPage() {
    const { userData } = useAuth()
    const [plans, setPlans] = useState<MembershipPlan[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration_months: 1,
        price: 0,
        features: [''],
        is_active: true
    })

    useEffect(() => {
        if (userData?.gymId) {
            fetchPlans()
        }
    }, [userData])

    const fetchPlans = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('membership_plans')
                .select('*')
                .eq('gym_id', userData?.gymId)
                .order('price', { ascending: true })

            if (error) throw error
            setPlans(data || [])
        } catch (error: any) {
            console.error('Error fetching membership plans:', error)
            showError('Error', 'Failed to load membership plans')
        } finally {
            setLoading(false)
        }
    }

    const handleOpenModal = (plan?: MembershipPlan) => {
        if (plan) {
            setEditingPlan(plan)
            setFormData({
                name: plan.name,
                description: plan.description,
                duration_months: plan.duration_months,
                price: plan.price,
                features: plan.features,
                is_active: plan.is_active
            })
        } else {
            setEditingPlan(null)
            setFormData({
                name: '',
                description: '',
                duration_months: 1,
                price: 0,
                features: [''],
                is_active: true
            })
        }
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingPlan(null)
    }

    const handleAddFeature = () => {
        setFormData({ ...formData, features: [...formData.features, ''] })
    }

    const handleRemoveFeature = (index: number) => {
        const updatedFeatures = formData.features.filter((_, i) => i !== index)
        setFormData({ ...formData, features: updatedFeatures })
    }

    const handleFeatureChange = (index: number, value: string) => {
        const updatedFeatures = [...formData.features]
        updatedFeatures[index] = value
        setFormData({ ...formData, features: updatedFeatures })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const validFeatures = formData.features.filter(f => f.trim() !== '')

            if (editingPlan) {
                // Update existing plan
                const { error } = await supabase
                    .from('membership_plans')
                    .update({
                        name: formData.name,
                        description: formData.description,
                        duration_months: formData.duration_months,
                        price: formData.price,
                        features: validFeatures,
                        is_active: formData.is_active
                    })
                    .eq('id', editingPlan.id)

                if (error) throw error
                showSuccess('Success', 'Membership plan updated successfully!')
            } else {
                // Create new plan
                const { error } = await supabase
                    .from('membership_plans')
                    .insert([{
                        gym_id: userData?.gymId,
                        name: formData.name,
                        description: formData.description,
                        duration_months: formData.duration_months,
                        price: formData.price,
                        features: validFeatures,
                        is_active: formData.is_active
                    }])

                if (error) throw error
                showSuccess('Success', 'Membership plan created successfully!')
            }

            handleCloseModal()
            fetchPlans()
        } catch (error: any) {
            console.error('Error saving plan:', error)
            showError('Error', 'Failed to save membership plan: ' + error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (planId: string) => {
        if (!confirm('Are you sure you want to delete this membership plan?')) {
            return
        }

        try {
            const { error } = await supabase
                .from('membership_plans')
                .delete()
                .eq('id', planId)

            if (error) throw error
            showSuccess('Success', 'Membership plan deleted successfully!')
            fetchPlans()
        } catch (error: any) {
            console.error('Error deleting plan:', error)
            showError('Error', 'Failed to delete membership plan')
        }
    }

    const handleToggleActive = async (plan: MembershipPlan) => {
        try {
            const { error } = await supabase
                .from('membership_plans')
                .update({ is_active: !plan.is_active })
                .eq('id', plan.id)

            if (error) throw error
            showSuccess('Success', `Plan ${!plan.is_active ? 'activated' : 'deactivated'} successfully!`)
            fetchPlans()
        } catch (error: any) {
            console.error('Error toggling plan status:', error)
            showError('Error', 'Failed to update plan status')
        }
    }

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loading}>Loading membership plans...</div>
            </div>
        )
    }

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Membership Plans</h1>
                    <p className={styles.subtitle}>
                        Create and manage membership plans for your gym members
                    </p>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    variant="primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={20} />
                    Add New Plan
                </Button>
            </div>

            {/* Plans Grid */}
            <div className={styles.plansGrid}>
                {plans.length === 0 ? (
                    <Card style={{ padding: '3rem', textAlign: 'center', gridColumn: '1 / -1' }}>
                        <h3>No membership plans yet</h3>
                        <p style={{ marginTop: '1rem', color: '#6b7280' }}>
                            Create your first membership plan to get started
                        </p>
                        <Button
                            onClick={() => handleOpenModal()}
                            variant="primary"
                            style={{ marginTop: '1.5rem' }}
                        >
                            <Plus size={20} />
                            Create Plan
                        </Button>
                    </Card>
                ) : (
                    plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`${styles.planCard} ${!plan.is_active ? styles.inactive : ''}`}
                        >
                            {!plan.is_active && <div className={styles.inactiveBadge}>Inactive</div>}

                            <div className={styles.planHeader}>
                                <h3 className={styles.planName}>{plan.name}</h3>
                                <p className={styles.planDescription}>{plan.description}</p>
                            </div>

                            <div className={styles.pricing}>
                                <div className={styles.price}>
                                    ₹{plan.price.toLocaleString('en-IN')}
                                    <span className={styles.period}>
                                        /{plan.duration_months} {plan.duration_months === 1 ? 'month' : 'months'}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.features}>
                                {plan.features.map((feature, index) => (
                                    <div key={index} className={styles.feature}>
                                        <Check size={18} color="#8b5cf6" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                                <Button
                                    variant="secondary"
                                    onClick={() => handleOpenModal(plan)}
                                    style={{ flex: 1 }}
                                >
                                    <Edit2 size={16} />
                                    Edit
                                </Button>
                                <Button
                                    variant={plan.is_active ? 'ghost' : 'primary'}
                                    onClick={() => handleToggleActive(plan)}
                                    style={{ flex: 1 }}
                                >
                                    {plan.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleDelete(plan.id)}
                                    style={{ color: '#ef4444' }}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={handleCloseModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{editingPlan ? 'Edit Membership Plan' : 'Add New Membership Plan'}</h2>
                            <button className={styles.closeBtn} onClick={handleCloseModal}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.planForm}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Plan Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Gold Annual, Silver Monthly"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Description *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="e.g., Best value for committed members"
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Duration (Months) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.duration_months}
                                        onChange={(e) => setFormData({ ...formData, duration_months: Number(e.target.value) })}
                                        placeholder="1"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Price (₹) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        placeholder="1500"
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Features</label>
                                {formData.features.map((feature, index) => (
                                    <div key={index} className={styles.featureRow}>
                                        <input
                                            type="text"
                                            value={feature}
                                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                                            placeholder="e.g., Access to all equipment"
                                        />
                                        {formData.features.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFeature(index)}
                                                className={styles.removeFeatureBtn}
                                            >
                                                <X size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddFeature}
                                    className={styles.addFeatureBtn}
                                >
                                    <Plus size={18} /> Add Feature
                                </button>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                    <span>Active (visible to members)</span>
                                </label>
                            </div>

                            <div className={styles.formActions}>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
