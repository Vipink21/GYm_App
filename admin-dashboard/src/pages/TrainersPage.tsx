import { useState, useMemo } from 'react'
import { Plus, Search, Filter, Download, Star, X, ChevronDown } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import styles from './TrainersPage.module.css'

interface Trainer {
    id: string
    name: string
    phone: string
    email: string
    specializations: string[]
    clients: number
    maxClients: number
    rating: number
    experience: number
    status: 'active' | 'on_leave' | 'inactive'
}

const initialTrainers: Trainer[] = [
    {
        id: '1',
        name: 'Sarah Mitchell',
        phone: '+91 98765 43210',
        email: 'sarah@fitzone.com',
        specializations: ['Weight Training', 'HIIT'],
        clients: 18,
        maxClients: 25,
        rating: 4.9,
        experience: 5,
        status: 'active'
    },
    {
        id: '2',
        name: 'Mike Thompson',
        phone: '+91 87654 32109',
        email: 'mike@fitzone.com',
        specializations: ['CrossFit', 'Nutrition'],
        clients: 22,
        maxClients: 25,
        rating: 4.8,
        experience: 7,
        status: 'active'
    },
    {
        id: '3',
        name: 'Priya Sharma',
        phone: '+91 76543 21098',
        email: 'priya@fitzone.com',
        specializations: ['Yoga', 'Pilates'],
        clients: 15,
        maxClients: 20,
        rating: 5.0,
        experience: 4,
        status: 'active'
    },
    {
        id: '4',
        name: 'John Davis',
        phone: '+91 65432 10987',
        email: 'john@fitzone.com',
        specializations: ['Boxing', 'Cardio'],
        clients: 12,
        maxClients: 20,
        rating: 4.7,
        experience: 6,
        status: 'on_leave'
    },
    {
        id: '5',
        name: 'Ananya Reddy',
        phone: '+91 54321 09876',
        email: 'ananya@fitzone.com',
        specializations: ['Zumba', 'Dance Fitness'],
        clients: 25,
        maxClients: 30,
        rating: 4.9,
        experience: 3,
        status: 'active'
    },
]

const allSpecializations = ['All Specializations', 'Weight Training', 'HIIT', 'CrossFit', 'Nutrition', 'Yoga', 'Pilates', 'Boxing', 'Cardio', 'Zumba', 'Dance Fitness']
const statuses = ['All Status', 'active', 'on_leave', 'inactive']

export function TrainersPage() {
    const [trainers, setTrainers] = useState<Trainer[]>(initialTrainers)
    const [searchQuery, setSearchQuery] = useState('')
    const [showFilterDropdown, setShowFilterDropdown] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)

    // Filter states
    const [selectedSpecialization, setSelectedSpecialization] = useState('All Specializations')
    const [selectedStatus, setSelectedStatus] = useState('All Status')

    // New trainer form state
    const [newTrainer, setNewTrainer] = useState({
        name: '',
        phone: '',
        email: '',
        specializations: [] as string[],
        maxClients: 20,
        experience: 1
    })

    // Computed stats
    const stats = useMemo(() => ({
        total: trainers.length,
        active: trainers.filter(t => t.status === 'active').length,
        onLeave: trainers.filter(t => t.status === 'on_leave').length,
        avgRating: (trainers.reduce((sum, t) => sum + t.rating, 0) / trainers.length).toFixed(1)
    }), [trainers])

    // Filter trainers based on search and filters
    const filteredTrainers = useMemo(() => {
        return trainers.filter(trainer => {
            const matchesSearch = trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                trainer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                trainer.specializations.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))

            const matchesSpec = selectedSpecialization === 'All Specializations' ||
                trainer.specializations.includes(selectedSpecialization)
            const matchesStatus = selectedStatus === 'All Status' || trainer.status === selectedStatus

            return matchesSearch && matchesSpec && matchesStatus
        })
    }, [trainers, searchQuery, selectedSpecialization, selectedStatus])

    const activeFiltersCount = [selectedSpecialization, selectedStatus].filter(
        (f, i) => f !== ['All Specializations', 'All Status'][i]
    ).length

    const clearFilters = () => {
        setSelectedSpecialization('All Specializations')
        setSelectedStatus('All Status')
    }

    // Export to CSV
    const handleExport = () => {
        const headers = ['Name', 'Phone', 'Email', 'Specializations', 'Clients', 'Max Clients', 'Rating', 'Experience', 'Status']
        const csvContent = [
            headers.join(','),
            ...filteredTrainers.map(t =>
                [t.name, t.phone, t.email, `"${t.specializations.join('; ')}"`, t.clients, t.maxClients, t.rating, t.experience, t.status].join(',')
            )
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `trainers_export_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        URL.revokeObjectURL(link.href)
    }

    // Add new trainer
    const handleAddTrainer = (e: React.FormEvent) => {
        e.preventDefault()
        const trainer: Trainer = {
            id: String(Date.now()),
            ...newTrainer,
            clients: 0,
            rating: 5.0,
            status: 'active'
        }
        setTrainers([trainer, ...trainers])
        setNewTrainer({ name: '', phone: '', email: '', specializations: [], maxClients: 20, experience: 1 })
        setShowAddModal(false)
    }

    const toggleSpecialization = (spec: string) => {
        setNewTrainer(prev => ({
            ...prev,
            specializations: prev.specializations.includes(spec)
                ? prev.specializations.filter(s => s !== spec)
                : [...prev.specializations, spec]
        }))
    }

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'active': return styles.statusActive
            case 'on_leave': return styles.statusLeave
            case 'inactive': return styles.statusInactive
            default: return ''
        }
    }

    const getCapacityClass = (clients: number, max: number) => {
        const ratio = clients / max
        if (ratio >= 0.9) return styles.capacityFull
        if (ratio >= 0.7) return styles.capacityHigh
        return styles.capacityNormal
    }

    return (
        <div className={styles.page}>
            {/* Stats Summary */}
            <div className={styles.statsRow}>
                <div className={styles.statPill}>
                    <span className={styles.statValue}>{stats.total}</span>
                    <span className={styles.statLabel}>Total Trainers</span>
                </div>
                <div className={styles.statPill}>
                    <span className={styles.statValue}>{stats.active}</span>
                    <span className={styles.statLabel}>Active</span>
                </div>
                <div className={styles.statPill}>
                    <span className={styles.statValue}>{stats.onLeave}</span>
                    <span className={styles.statLabel}>On Leave</span>
                </div>
                <div className={styles.statPill}>
                    <span className={styles.statValue}>{stats.avgRating}</span>
                    <span className={styles.statLabel}>Avg Rating</span>
                </div>
            </div>

            {/* Header Actions */}
            <div className={styles.actions}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search trainers..."
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
                                    <label>Specialization</label>
                                    <select
                                        value={selectedSpecialization}
                                        onChange={(e) => setSelectedSpecialization(e.target.value)}
                                    >
                                        {allSpecializations.map(spec => (
                                            <option key={spec} value={spec}>{spec}</option>
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
                                                {status === 'All Status' ? status : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </option>
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
                        <Plus size={16} /> Add Trainer
                    </Button>
                </div>
            </div>

            {/* Active Filters Tags */}
            {activeFiltersCount > 0 && (
                <div className={styles.activeFilters}>
                    {selectedSpecialization !== 'All Specializations' && (
                        <span className={styles.filterTag}>
                            {selectedSpecialization}
                            <X size={12} onClick={() => setSelectedSpecialization('All Specializations')} />
                        </span>
                    )}
                    {selectedStatus !== 'All Status' && (
                        <span className={styles.filterTag}>
                            {selectedStatus.replace('_', ' ')}
                            <X size={12} onClick={() => setSelectedStatus('All Status')} />
                        </span>
                    )}
                </div>
            )}

            {/* Results count */}
            <p className={styles.resultsCount}>
                Showing {filteredTrainers.length} of {trainers.length} trainers
            </p>

            {/* Trainers Table */}
            <Card padding="sm">
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Trainer</th>
                            <th>Contact</th>
                            <th>Specializations</th>
                            <th>Clients</th>
                            <th>Rating</th>
                            <th>Experience</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTrainers.length === 0 ? (
                            <tr>
                                <td colSpan={8} className={styles.emptyState}>
                                    No trainers found matching your criteria
                                </td>
                            </tr>
                        ) : (
                            filteredTrainers.map((trainer) => (
                                <tr key={trainer.id}>
                                    <td>
                                        <div className={styles.trainerCell}>
                                            <div className={styles.avatar}>{trainer.name.charAt(0)}</div>
                                            <span className={styles.trainerName}>{trainer.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.contactCell}>
                                            <span>{trainer.phone}</span>
                                            <span className={styles.email}>{trainer.email}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.tags}>
                                            {trainer.specializations.map((spec) => (
                                                <span key={spec} className={styles.tag}>{spec}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`${styles.capacity} ${getCapacityClass(trainer.clients, trainer.maxClients)}`}>
                                            {trainer.clients}/{trainer.maxClients}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.rating}>
                                            <Star size={14} className={styles.starIcon} />
                                            <span>{trainer.rating}</span>
                                        </div>
                                    </td>
                                    <td>{trainer.experience} yrs</td>
                                    <td>
                                        <span className={`${styles.status} ${getStatusClass(trainer.status)}`}>
                                            {trainer.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        <button className={styles.moreBtn}>•••</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </Card>

            {/* Add Trainer Modal */}
            {showAddModal && (
                <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Add New Trainer</h2>
                            <button className={styles.closeModal} onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddTrainer} className={styles.modalForm}>
                            <div className={styles.formGroup}>
                                <label htmlFor="name">Full Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    value={newTrainer.name}
                                    onChange={(e) => setNewTrainer({ ...newTrainer, name: e.target.value })}
                                    placeholder="Enter trainer name"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="phone">Phone Number *</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    required
                                    value={newTrainer.phone}
                                    onChange={(e) => setNewTrainer({ ...newTrainer, phone: e.target.value })}
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email Address *</label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={newTrainer.email}
                                    onChange={(e) => setNewTrainer({ ...newTrainer, email: e.target.value })}
                                    placeholder="trainer@fitzone.com"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Specializations *</label>
                                <div className={styles.specGrid}>
                                    {allSpecializations.filter(s => s !== 'All Specializations').map(spec => (
                                        <button
                                            key={spec}
                                            type="button"
                                            className={`${styles.specOption} ${newTrainer.specializations.includes(spec) ? styles.specSelected : ''}`}
                                            onClick={() => toggleSpecialization(spec)}
                                        >
                                            {spec}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="maxClients">Max Clients</label>
                                    <input
                                        type="number"
                                        id="maxClients"
                                        min={1}
                                        max={50}
                                        value={newTrainer.maxClients}
                                        onChange={(e) => setNewTrainer({ ...newTrainer, maxClients: Number(e.target.value) })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="experience">Experience (years)</label>
                                    <input
                                        type="number"
                                        id="experience"
                                        min={0}
                                        max={30}
                                        value={newTrainer.experience}
                                        onChange={(e) => setNewTrainer({ ...newTrainer, experience: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className={styles.modalActions}>
                                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={newTrainer.specializations.length === 0}>
                                    Add Trainer
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
