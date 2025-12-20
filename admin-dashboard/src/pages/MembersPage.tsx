import { useState, useMemo, useEffect } from 'react'
import { Plus, Search, Filter, Download, X, ChevronDown, Edit, Trash2, User, Phone, Mail, CreditCard, Dumbbell } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import styles from './MembersPage.module.css'
import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { memberService, MemberUI } from '../services/memberService'
import { subscriptionService } from '../services/subscriptionService'
import { gymService } from '../services/gymService'
import { showError, showConfirm, showSuccess } from '../utils/swal'
import { razorpayService } from '../services/razorpayService'

// Use MemberUI from service
type Member = MemberUI

const plans = ['All Plans', 'Gold Annual', 'Silver Monthly', 'Platinum', 'Bronze']
const statuses = ['All Status', 'active', 'expiring', 'expired']
const trainers = ['All Trainers', 'Sarah M.', 'Mike T.', 'John D.']

export function MembersPage() {
    const { user, userData, createGym } = useAuth()
    const [members, setMembers] = useState<Member[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showFilterDropdown, setShowFilterDropdown] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null)

    const userRole = userData?.role || 'member'
    const isTrainer = userRole === 'trainer'
    const isMember = userRole === 'member'

    if (isMember) {
        return <Navigate to="/" replace />
    }

    // Filter states
    const [selectedPlan, setSelectedPlan] = useState('All Plans')
    const [selectedStatus, setSelectedStatus] = useState('All Status')
    const [selectedTrainer, setSelectedTrainer] = useState('All Trainers')

    // New member form state
    const [newMember, setNewMember] = useState({
        full_name: '',
        phone: '',
        email: '',
        plan: 'Gold Annual',
        trainer_name: 'Sarah M.',
        status: 'active'
    })

    // Fetch members on mount
    useEffect(() => {
        async function fetchMembers() {
            if (!user) return

            try {
                // Use the gym ID associated with the user, or fallback to user ID (though gymId is preferred)
                const gymId = userData?.gymId || user.id
                const data = await memberService.getMembers(gymId)
                setMembers(data)
            } catch (error) {
                console.error('Error fetching members:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchMembers()
    }, [user])

    // Filter members based on search and filters
    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            const matchesSearch = member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.phone?.includes(searchQuery)

            const matchesPlan = selectedPlan === 'All Plans' || member.plan === selectedPlan
            const matchesStatus = selectedStatus === 'All Status' || member.status === selectedStatus
            const matchesTrainer = selectedTrainer === 'All Trainers' || member.trainer_name === selectedTrainer

            return matchesSearch && matchesPlan && matchesStatus && matchesTrainer
        })
    }, [members, searchQuery, selectedPlan, selectedStatus, selectedTrainer])

    const activeFiltersCount = [selectedPlan, selectedStatus, selectedTrainer].filter(
        (f, i) => f !== ['All Plans', 'All Status', 'All Trainers'][i]
    ).length

    const clearFilters = () => {
        setSelectedPlan('All Plans')
        setSelectedStatus('All Status')
        setSelectedTrainer('All Trainers')
    }

    // Export to CSV
    const handleExport = () => {
        const headers = ['Name', 'Phone', 'Email', 'Plan', 'Status', 'Trainer', 'Joined']
        const csvContent = [
            headers.join(','),
            ...filteredMembers.map(m =>
                [m.full_name, m.phone, m.email, m.plan, m.status, m.trainer_name, m.joined_date].join(',')
            )
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `members_export_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        URL.revokeObjectURL(link.href)
    }

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setIsSubmitting(true)
        try {
            if (editingMemberId) {
                // Editing existing member - no payment required
                await memberService.updateMember(editingMemberId, newMember)
                // Optimistic update
                setMembers(members.map(m =>
                    m.id === editingMemberId
                        ? { ...m, ...newMember, full_name: newMember.full_name, status: newMember.status as any }
                        : m
                ))
                resetForm()
            } else {
                // Adding new member
                let gymId = userData?.gymId

                if (!gymId) {
                    try {
                        const existingGyms = await gymService.getGyms()
                        if (existingGyms && existingGyms.length > 0) {
                            gymId = existingGyms[0].id
                        }
                    } catch (err) {
                        console.warn('Error checking for existing gyms:', err)
                    }

                    if (!gymId) {
                        const newGymId = await createGym('My Gym')
                        if (newGymId) {
                            gymId = newGymId
                            showSuccess('Gym Created', 'A new Gym Profile has been created for you.')
                        } else {
                            throw new Error('User is not associated with a Gym. Please contact support.')
                        }
                    }
                }

                let canAdd = await subscriptionService.canAddMember(gymId)

                if (!canAdd.allowed && canAdd.reason === 'No active subscription found') {
                    const activated = await subscriptionService.activateFreePlan(gymId)
                    if (activated) {
                        canAdd = await subscriptionService.canAddMember(gymId)
                    }
                }

                if (!canAdd.allowed) {
                    showError('Limit Reached', canAdd.reason || 'Cannot add member. Please upgrade your plan.')
                    setIsSubmitting(false)
                    return
                }

                // Check if plan requires payment
                const isFreePlan = razorpayService.isFreeTier(newMember.plan)

                if (!isFreePlan) {
                    // Get plan price
                    const planPrice = await razorpayService.getMembershipPlanPrice(newMember.plan, gymId)

                    // Show payment modal
                    await new Promise((resolve, reject) => {
                        razorpayService.openMembershipCheckout(
                            {
                                gymId,
                                memberName: newMember.full_name,
                                memberEmail: newMember.email,
                                memberPhone: newMember.phone,
                                planName: newMember.plan,
                                planPrice
                            },
                            async (response) => {
                                // Payment successful - proceed with member creation
                                try {
                                    const newMemberData = {
                                        gym_id: gymId,
                                        ...newMember
                                    }
                                    const createdUser = await memberService.createMember(newMemberData)

                                    // Update payment record with member ID
                                    await razorpayService.recordMembershipPayment({
                                        gymId,
                                        memberId: createdUser.id,
                                        amount: planPrice,
                                        razorpayOrderId: response.razorpay_order_id,
                                        razorpayPaymentId: response.razorpay_payment_id,
                                        razorpaySignature: response.razorpay_signature,
                                        planName: newMember.plan,
                                        memberName: newMember.full_name
                                    })

                                    const uiMember: Member = {
                                        id: createdUser.id,
                                        full_name: newMember.full_name,
                                        phone: newMember.phone,
                                        email: newMember.email,
                                        plan: newMember.plan,
                                        status: newMember.status as any,
                                        trainer_name: newMember.trainer_name,
                                        joined_date: new Date().toISOString().split('T')[0]
                                    }
                                    setMembers([uiMember, ...members])

                                    showSuccess('Success!', 'Payment successful and member registered!')
                                    resolve(true)
                                } catch (error: any) {
                                    console.error('Error creating member after payment:', error)
                                    showError('Error', 'Payment successful but member registration failed. Please contact support.')
                                    reject(error)
                                }
                            },
                            (error) => {
                                // Payment failed or cancelled
                                console.error('Payment failed:', error)
                                showError('Payment Failed', error.message || 'Payment was not completed. Member registration cancelled.')
                                reject(error)
                            }
                        )
                    })

                    resetForm()
                } else {
                    // Free plan - no payment required
                    const newMemberData = {
                        gym_id: gymId,
                        ...newMember
                    }
                    const createdUser = await memberService.createMember(newMemberData)

                    const uiMember: Member = {
                        id: createdUser.id,
                        full_name: newMember.full_name,
                        phone: newMember.phone,
                        email: newMember.email,
                        plan: newMember.plan,
                        status: newMember.status as any,
                        trainer_name: newMember.trainer_name,
                        joined_date: new Date().toISOString().split('T')[0]
                    }
                    setMembers([uiMember, ...members])

                    showSuccess('Success!', 'Member registered successfully!')
                    resetForm()
                }
            }
        } catch (error: any) {
            console.error('Error saving member:', error)
            if (error.message !== 'Payment cancelled by user') {
                showError('Error', error.message)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteMember = async (id: string) => {
        const result = await showConfirm('Delete Member', 'Are you sure you want to delete this member?')
        if (!result.isConfirmed) return
        try {
            await memberService.deleteMember(id)
            setMembers(members.filter(m => m.id !== id))
            showSuccess('Deleted', 'Member has been deleted successfully.')
        } catch (error: any) {
            console.error('Error deleting member:', error)
            showError('Error', error.message || 'Failed to delete member')
        }
    }

    const startEditMember = (member: Member) => {
        setNewMember({
            full_name: member.full_name,
            phone: member.phone,
            email: member.email,
            plan: member.plan,
            trainer_name: member.trainer_name,
            status: member.status
        })
        setEditingMemberId(member.id)
        setShowAddModal(true)
    }

    const resetForm = () => {
        setNewMember({ full_name: '', phone: '', email: '', plan: 'Gold Annual', trainer_name: 'Sarah M.', status: 'active' })
        setEditingMemberId(null)
        setShowAddModal(false)
    }

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'active': return styles.statusActive
            case 'expiring': return styles.statusExpiring
            case 'expired': return styles.statusExpired
            default: return ''
        }
    }

    return (
        <div className={styles.page}>
            {/* Header Actions */}
            <div className={styles.actions}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search members..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            className={styles.clearSearch}
                            onClick={() => setSearchQuery('')}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div className={styles.actionButtons}>
                    <div className={styles.filterWrapper}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            className={activeFiltersCount > 0 ? styles.filterActive : ''}
                        >
                            <Filter size={16} /> Filter
                            {activeFiltersCount > 0 && (
                                <span className={styles.filterBadge}>{activeFiltersCount}</span>
                            )}
                            <ChevronDown size={14} />
                        </Button>

                        {showFilterDropdown && (
                            <div className={styles.filterDropdown}>
                                <div className={styles.filterHeader}>
                                    <span>Filters</span>
                                    {activeFiltersCount > 0 && (
                                        <button className={styles.clearFilters} onClick={clearFilters}>
                                            Clear all
                                        </button>
                                    )}
                                </div>

                                <div className={styles.filterGroup}>
                                    <label>Plan</label>
                                    <select
                                        value={selectedPlan}
                                        onChange={(e) => setSelectedPlan(e.target.value)}
                                    >
                                        {plans.map(plan => (
                                            <option key={plan} value={plan}>{plan}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.filterGroup}>
                                    <label>Status</label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                    >
                                        {statuses.map(status => (
                                            <option key={status} value={status}>
                                                {status === 'All Status' ? status : status.charAt(0).toUpperCase() + status.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.filterGroup}>
                                    <label>Trainer</label>
                                    <select
                                        value={selectedTrainer}
                                        onChange={(e) => setSelectedTrainer(e.target.value)}
                                    >
                                        {trainers.map(trainer => (
                                            <option key={trainer} value={trainer}>{trainer}</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    className={styles.applyFilters}
                                    onClick={() => setShowFilterDropdown(false)}
                                >
                                    Apply Filters
                                </button>
                            </div>
                        )}
                    </div>

                    <Button variant="ghost" size="sm" onClick={handleExport}>
                        <Download size={16} /> Export
                    </Button>
                    {!isTrainer && (
                        <Button size="sm" onClick={() => {
                            resetForm()
                            setShowAddModal(true)
                        }}>
                            <Plus size={16} /> Add Member
                        </Button>
                    )}
                </div>
            </div>

            {activeFiltersCount > 0 && (
                <div className={styles.activeFilters}>
                    {selectedPlan !== 'All Plans' && (
                        <span className={styles.filterTag}>
                            {selectedPlan}
                            <X size={12} onClick={() => setSelectedPlan('All Plans')} />
                        </span>
                    )}
                    {selectedStatus !== 'All Status' && (
                        <span className={styles.filterTag}>
                            {selectedStatus}
                            <X size={12} onClick={() => setSelectedStatus('All Status')} />
                        </span>
                    )}
                    {selectedTrainer !== 'All Trainers' && (
                        <span className={styles.filterTag}>
                            {selectedTrainer}
                            <X size={12} onClick={() => setSelectedTrainer('All Trainers')} />
                        </span>
                    )}
                </div>
            )}

            <p className={styles.resultsCount}>
                Showing {filteredMembers.length} of {members.length} members
            </p>

            <Card padding="sm">
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Member</th>
                            <th>Contact</th>
                            <th>Plan</th>
                            <th>Status</th>
                            <th>Trainer</th>
                            <th>Joined</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className={styles.emptyState}>Loading members...</td></tr>
                        ) : filteredMembers.length === 0 ? (
                            <tr>
                                <td colSpan={7} className={styles.emptyState}>
                                    No members found matching your criteria
                                </td>
                            </tr>
                        ) : (
                            filteredMembers.map((member) => (
                                <tr key={member.id}>
                                    <td>
                                        <div className={styles.memberCell}>
                                            <div className={styles.avatar}>{member.full_name?.charAt(0)}</div>
                                            <span className={styles.memberName}>{member.full_name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.contactCell}>
                                            <span>{member.phone}</span>
                                            <span className={styles.email}>{member.email}</span>
                                        </div>
                                    </td>
                                    <td>{member.plan}</td>
                                    <td>
                                        <span className={`${styles.status} ${getStatusClass(member.status)}`}>
                                            {member.status}
                                        </span>
                                    </td>
                                    <td>{member.trainer_name}</td>
                                    <td>{member.joined_date}</td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            {!isTrainer ? (
                                                <>
                                                    <button
                                                        className={styles.iconBtn}
                                                        onClick={() => startEditMember(member)}
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        className={`${styles.iconBtn} ${styles.deleteBtn}`}
                                                        onClick={() => handleDeleteMember(member.id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>View Only</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </Card>

            {showAddModal && (
                <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{editingMemberId ? 'Edit Member' : 'Add New Member'}</h2>
                            <button className={styles.closeModal} onClick={resetForm}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddMember} className={styles.modalForm}>
                            <div className="premium-form-group">
                                <label className="premium-label" htmlFor="name"><User size={16} /> Full Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    value={newMember.full_name}
                                    onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })}
                                    placeholder="e.g. Rahul Sharma"
                                    className="premium-input"
                                />
                            </div>

                            <div className="premium-form-row">
                                <div className="premium-form-group">
                                    <label className="premium-label" htmlFor="phone"><Phone size={16} /> Phone Number *</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        required
                                        value={newMember.phone}
                                        onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                                        placeholder="+91 98765 43210"
                                        className="premium-input"
                                    />
                                </div>
                                <div className="premium-form-group">
                                    <label className="premium-label" htmlFor="email"><Mail size={16} /> Email Address *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        value={newMember.email}
                                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                        placeholder="rahul@example.com"
                                        className="premium-input"
                                    />
                                </div>
                            </div>

                            <div className="premium-form-row">
                                <div className="premium-form-group">
                                    <label className="premium-label" htmlFor="plan"><CreditCard size={16} /> Membership Plan</label>
                                    <select
                                        id="plan"
                                        value={newMember.plan}
                                        onChange={(e) => setNewMember({ ...newMember, plan: e.target.value })}
                                        className="premium-input"
                                        style={{ appearance: 'auto' }}
                                    >
                                        {plans.filter(p => p !== 'All Plans').map(plan => (
                                            <option key={plan} value={plan}>{plan}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="premium-form-group">
                                    <label className="premium-label" htmlFor="trainer"><Dumbbell size={16} /> Assigned Trainer</label>
                                    <select
                                        id="trainer"
                                        value={newMember.trainer_name}
                                        onChange={(e) => setNewMember({ ...newMember, trainer_name: e.target.value })}
                                        className="premium-input"
                                        style={{ appearance: 'auto' }}
                                    >
                                        {trainers.filter(t => t !== 'All Trainers').map(trainer => (
                                            <option key={trainer} value={trainer}>{trainer}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <Button type="button" variant="ghost" onClick={resetForm}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting} style={{ padding: '0 2rem' }}>
                                    {isSubmitting ? 'Saving...' : (editingMemberId ? 'Update Member' : 'Add Member')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
