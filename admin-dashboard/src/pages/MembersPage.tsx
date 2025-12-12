import { useState, useMemo } from 'react'
import { Plus, Search, Filter, Download, X, ChevronDown } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import styles from './MembersPage.module.css'

interface Member {
    id: string
    name: string
    phone: string
    email: string
    plan: string
    status: 'active' | 'expiring' | 'expired'
    trainer: string
    joined: string
}

const initialMembers: Member[] = [
    { id: '1', name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'rahul@email.com', plan: 'Gold Annual', status: 'active', trainer: 'Sarah M.', joined: 'Jan 15, 2024' },
    { id: '2', name: 'Priya Patel', phone: '+91 87654 32109', email: 'priya@email.com', plan: 'Silver Monthly', status: 'active', trainer: 'Mike T.', joined: 'Feb 20, 2024' },
    { id: '3', name: 'Amit Kumar', phone: '+91 76543 21098', email: 'amit@email.com', plan: 'Gold Annual', status: 'expiring', trainer: 'Sarah M.', joined: 'Mar 10, 2024' },
    { id: '4', name: 'Sneha Gupta', phone: '+91 65432 10987', email: 'sneha@email.com', plan: 'Platinum', status: 'active', trainer: 'John D.', joined: 'Apr 5, 2024' },
    { id: '5', name: 'Vikram Singh', phone: '+91 54321 09876', email: 'vikram@email.com', plan: 'Gold Annual', status: 'expired', trainer: 'Sarah M.', joined: 'May 12, 2024' },
]

const plans = ['All Plans', 'Gold Annual', 'Silver Monthly', 'Platinum', 'Bronze']
const statuses = ['All Status', 'active', 'expiring', 'expired']
const trainers = ['All Trainers', 'Sarah M.', 'Mike T.', 'John D.']

export function MembersPage() {
    const [members, setMembers] = useState<Member[]>(initialMembers)
    const [searchQuery, setSearchQuery] = useState('')
    const [showFilterDropdown, setShowFilterDropdown] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)

    // Filter states
    const [selectedPlan, setSelectedPlan] = useState('All Plans')
    const [selectedStatus, setSelectedStatus] = useState('All Status')
    const [selectedTrainer, setSelectedTrainer] = useState('All Trainers')

    // New member form state
    const [newMember, setNewMember] = useState({
        name: '',
        phone: '',
        email: '',
        plan: 'Gold Annual',
        trainer: 'Sarah M.'
    })

    // Filter members based on search and filters
    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.phone.includes(searchQuery)

            const matchesPlan = selectedPlan === 'All Plans' || member.plan === selectedPlan
            const matchesStatus = selectedStatus === 'All Status' || member.status === selectedStatus
            const matchesTrainer = selectedTrainer === 'All Trainers' || member.trainer === selectedTrainer

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
                [m.name, m.phone, m.email, m.plan, m.status, m.trainer, m.joined].join(',')
            )
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `members_export_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        URL.revokeObjectURL(link.href)
    }

    // Add new member
    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault()
        const member: Member = {
            id: String(Date.now()),
            ...newMember,
            status: 'active',
            joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }
        setMembers([member, ...members])
        setNewMember({ name: '', phone: '', email: '', plan: 'Gold Annual', trainer: 'Sarah M.' })
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
                    {/* Filter Button with Dropdown */}
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
                    <Button size="sm" onClick={() => setShowAddModal(true)}>
                        <Plus size={16} /> Add Member
                    </Button>
                </div>
            </div>

            {/* Active Filters Tags */}
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

            {/* Results count */}
            <p className={styles.resultsCount}>
                Showing {filteredMembers.length} of {members.length} members
            </p>

            {/* Members Table */}
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
                        {filteredMembers.length === 0 ? (
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
                                            <div className={styles.avatar}>{member.name.charAt(0)}</div>
                                            <span className={styles.memberName}>{member.name}</span>
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
                                    <td>{member.trainer}</td>
                                    <td>{member.joined}</td>
                                    <td>
                                        <button className={styles.moreBtn}>•••</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </Card>

            {/* Add Member Modal */}
            {showAddModal && (
                <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Add New Member</h2>
                            <button className={styles.closeModal} onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddMember} className={styles.modalForm}>
                            <div className={styles.formGroup}>
                                <label htmlFor="name">Full Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    value={newMember.name}
                                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                    placeholder="Enter member name"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="phone">Phone Number *</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    required
                                    value={newMember.phone}
                                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email Address *</label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={newMember.email}
                                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                    placeholder="member@email.com"
                                />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="plan">Membership Plan</label>
                                    <select
                                        id="plan"
                                        value={newMember.plan}
                                        onChange={(e) => setNewMember({ ...newMember, plan: e.target.value })}
                                    >
                                        {plans.filter(p => p !== 'All Plans').map(plan => (
                                            <option key={plan} value={plan}>{plan}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="trainer">Assigned Trainer</label>
                                    <select
                                        id="trainer"
                                        value={newMember.trainer}
                                        onChange={(e) => setNewMember({ ...newMember, trainer: e.target.value })}
                                    >
                                        {trainers.filter(t => t !== 'All Trainers').map(trainer => (
                                            <option key={trainer} value={trainer}>{trainer}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className={styles.modalActions}>
                                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Add Member
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
