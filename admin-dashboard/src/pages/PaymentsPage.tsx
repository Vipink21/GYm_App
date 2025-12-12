import { useState, useMemo } from 'react'
import { Search, Filter, Download, CreditCard, Banknote, Smartphone, Building, Plus, X, ChevronDown, Check } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import styles from './PaymentsPage.module.css'

interface Transaction {
    id: string
    member: string
    type: string
    plan: string
    amount: number
    method: string
    status: 'success' | 'pending' | 'failed'
    date: string
    time: string
}

const initialTransactions: Transaction[] = [
    { id: 'TXN001', member: 'Rahul Sharma', type: 'membership', plan: 'Gold Annual', amount: 24999, method: 'razorpay', status: 'success', date: 'Dec 11, 2024', time: '10:34 AM' },
    { id: 'TXN002', member: 'Priya Patel', type: 'membership', plan: 'Silver Monthly', amount: 2499, method: 'upi', status: 'success', date: 'Dec 11, 2024', time: '09:15 AM' },
    { id: 'TXN003', member: 'Amit Kumar', type: 'class_pack', plan: '10 Class Pack', amount: 4999, method: 'card', status: 'success', date: 'Dec 10, 2024', time: '06:45 PM' },
    { id: 'TXN004', member: 'Sneha Gupta', type: 'membership', plan: 'Platinum', amount: 49999, method: 'bank_transfer', status: 'pending', date: 'Dec 10, 2024', time: '04:20 PM' },
    { id: 'TXN005', member: 'Vikram Singh', type: 'personal_training', plan: 'PT - 12 Sessions', amount: 15999, method: 'cash', status: 'success', date: 'Dec 10, 2024', time: '11:30 AM' },
    { id: 'TXN006', member: 'Anita Desai', type: 'membership', plan: 'Gold Annual', amount: 24999, method: 'razorpay', status: 'failed', date: 'Dec 9, 2024', time: '08:50 PM' },
    { id: 'TXN007', member: 'Rajesh Nair', type: 'membership', plan: 'Silver Monthly', amount: 2499, method: 'upi', status: 'success', date: 'Dec 9, 2024', time: '07:10 AM' },
    { id: 'TXN008', member: 'Meera Iyer', type: 'merchandise', plan: 'Gym Bag + T-Shirt', amount: 1999, method: 'cash', status: 'success', date: 'Dec 8, 2024', time: '05:45 PM' },
]

const paymentMethods = ['razorpay', 'upi', 'card', 'cash', 'bank_transfer']
const transactionTypes = ['membership', 'class_pack', 'personal_training', 'merchandise']
const statuses = ['success', 'pending', 'failed']

export function PaymentsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
    const [searchQuery, setSearchQuery] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [showFilterDropdown, setShowFilterDropdown] = useState(false)

    // Filter states
    const [selectedType, setSelectedType] = useState('All Types')
    const [selectedStatus, setSelectedStatus] = useState('All Status')
    const [selectedMethod, setSelectedMethod] = useState('All Methods')

    // New transaction form state
    const [newTransaction, setNewTransaction] = useState({
        member: '',
        type: 'membership',
        plan: '',
        amount: 0,
        method: 'card',
        status: 'success' as 'success' | 'pending' | 'failed'
    })

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        return transactions.filter(txn => {
            const matchesSearch =
                txn.member.toLowerCase().includes(searchQuery.toLowerCase()) ||
                txn.id.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesType = selectedType === 'All Types' || txn.type === selectedType
            const matchesStatus = selectedStatus === 'All Status' || txn.status === selectedStatus
            const matchesMethod = selectedMethod === 'All Methods' || txn.method === selectedMethod

            return matchesSearch && matchesType && matchesStatus && matchesMethod
        })
    }, [transactions, searchQuery, selectedType, selectedStatus, selectedMethod])

    const activeFiltersCount = [selectedType, selectedStatus, selectedMethod].filter(
        (f, i) => f !== ['All Types', 'All Status', 'All Methods'][i]
    ).length

    // Computed Stats
    const stats = useMemo(() => {
        const totalRevenue = transactions
            .filter(t => t.status === 'success')
            .reduce((sum, t) => sum + t.amount, 0)

        const thisWeek = transactions
            .filter(t => t.status === 'success') // Mock week filtering
            .reduce((sum, t) => sum + t.amount, 0)

        const pendingAmount = transactions
            .filter(t => t.status === 'pending')
            .reduce((sum, t) => sum + t.amount, 0)

        const pendingCount = transactions.filter(t => t.status === 'pending').length

        return { totalRevenue, thisWeek, pendingAmount, pendingCount }
    }, [transactions])

    const handleExport = () => {
        const headers = ['ID', 'Member', 'Type', 'Plan', 'Amount', 'Method', 'Status', 'Date']
        const csvContent = [
            headers.join(','),
            ...filteredTransactions.map(t =>
                [t.id, t.member, t.type, t.plan, t.amount, t.method, t.status, t.date].join(',')
            )
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `payments_export_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        URL.revokeObjectURL(link.href)
    }

    const handleAddTransaction = (e: React.FormEvent) => {
        e.preventDefault()
        const now = new Date()
        const txn: Transaction = {
            id: `TXN${String(Date.now()).slice(-6)}`,
            ...newTransaction,
            date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }
        setTransactions([txn, ...transactions])
        setNewTransaction({ member: '', type: 'membership', plan: '', amount: 0, method: 'card', status: 'success' })
        setShowAddModal(false)
    }

    const clearFilters = () => {
        setSelectedType('All Types')
        setSelectedStatus('All Status')
        setSelectedMethod('All Methods')
    }

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'success': return styles.statusSuccess
            case 'pending': return styles.statusPending
            case 'failed': return styles.statusFailed
            default: return ''
        }
    }

    const getMethodIcon = (method: string) => {
        switch (method) {
            case 'razorpay':
            case 'card': return <CreditCard size={14} />
            case 'upi': return <Smartphone size={14} />
            case 'cash': return <Banknote size={14} />
            case 'bank_transfer': return <Building size={14} />
            default: return <CreditCard size={14} />
        }
    }

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'membership': return 'Membership'
            case 'class_pack': return 'Class Pack'
            case 'personal_training': return 'PT Sessions'
            case 'merchandise': return 'Merchandise'
            default: return type.replace('_', ' ')
        }
    }

    return (
        <div className={styles.page}>
            {/* Revenue Stats */}
            <div className={styles.statsGrid}>
                <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                        <span className={styles.statLabel}>Today's Revenue</span>
                        <span className={styles.statValue}>{formatAmount(stats.totalRevenue / 10)}</span>
                        <span className={styles.statChange}>+12% from yesterday</span>
                    </div>
                    <div className={`${styles.statIcon} ${styles.gold}`}>₹</div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                        <span className={styles.statLabel}>This Week</span>
                        <span className={styles.statValue}>{formatAmount(stats.thisWeek)}</span>
                        <span className={styles.statChange}>+8% from last week</span>
                    </div>
                    <div className={`${styles.statIcon} ${styles.blue}`}>📊</div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                        <span className={styles.statLabel}>Total Revenue</span>
                        <span className={styles.statValue}>{formatAmount(stats.totalRevenue)}</span>
                        <span className={styles.statChange}>+15% from last month</span>
                    </div>
                    <div className={`${styles.statIcon} ${styles.green}`}>📈</div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                        <span className={styles.statLabel}>Pending</span>
                        <span className={styles.statValue}>{formatAmount(stats.pendingAmount)}</span>
                        <span className={styles.statSub}>{stats.pendingCount} transactions</span>
                    </div>
                    <div className={`${styles.statIcon} ${styles.orange}`}>⏳</div>
                </Card>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by member or transaction ID..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className={styles.clearSearch} onClick={() => setSearchQuery('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className={styles.actionButtons}>
                    {/* Filter Dropdown */}
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
                                    <label>Type</label>
                                    <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                                        <option value="All Types">All Types</option>
                                        {transactionTypes.map(t => (
                                            <option key={t} value={t}>{getTypeLabel(t)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.filterGroup}>
                                    <label>Status</label>
                                    <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                                        <option value="All Status">All Status</option>
                                        <option value="success">Success</option>
                                        <option value="pending">Pending</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                </div>
                                <div className={styles.filterGroup}>
                                    <label>Method</label>
                                    <select value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value)}>
                                        <option value="All Methods">All Methods</option>
                                        {paymentMethods.map(m => (
                                            <option key={m} value={m}>{m.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                                <button className={styles.applyFilters} onClick={() => setShowFilterDropdown(false)}>
                                    Apply Filters
                                </button>
                            </div>
                        )}
                    </div>

                    <Button variant="ghost" size="sm" onClick={handleExport}>
                        <Download size={16} /> Export
                    </Button>
                    <Button size="sm" onClick={() => setShowAddModal(true)}>
                        <Plus size={16} /> Record Payment
                    </Button>
                </div>
            </div>

            {/* Active Filters Tags */}
            {activeFiltersCount > 0 && (
                <div className={styles.activeFilters}>
                    {selectedType !== 'All Types' && (
                        <span className={styles.filterTag}>
                            {getTypeLabel(selectedType)} <X size={12} onClick={() => setSelectedType('All Types')} />
                        </span>
                    )}
                    {selectedStatus !== 'All Status' && (
                        <span className={styles.filterTag}>
                            {selectedStatus} <X size={12} onClick={() => setSelectedStatus('All Status')} />
                        </span>
                    )}
                    {selectedMethod !== 'All Methods' && (
                        <span className={styles.filterTag}>
                            {selectedMethod} <X size={12} onClick={() => setSelectedMethod('All Methods')} />
                        </span>
                    )}
                </div>
            )}

            {/* Transactions Table */}
            <Card padding="sm">
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Transaction ID</th>
                            <th>Member</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.length === 0 ? (
                            <tr>
                                <td colSpan={9} className={styles.emptyState}>No transactions found</td>
                            </tr>
                        ) : (
                            filteredTransactions.map((txn) => (
                                <tr key={txn.id}>
                                    <td>
                                        <span className={styles.txnId}>{txn.id}</span>
                                    </td>
                                    <td>
                                        <div className={styles.memberCell}>
                                            <div className={styles.avatar}>{txn.member.charAt(0)}</div>
                                            <span>{txn.member}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={styles.typeTag}>{getTypeLabel(txn.type)}</span>
                                    </td>
                                    <td>{txn.plan}</td>
                                    <td>
                                        <span className={styles.amount}>{formatAmount(txn.amount)}</span>
                                    </td>
                                    <td>
                                        <div className={styles.method}>
                                            {getMethodIcon(txn.method)}
                                            <span>{txn.method.replace('_', ' ')}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.status} ${getStatusClass(txn.status)}`}>
                                            {txn.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.dateCell}>
                                            <span>{txn.date}</span>
                                            <span className={styles.time}>{txn.time}</span>
                                        </div>
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

            {/* Record Payment Modal */}
            {showAddModal && (
                <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Record Payment</h2>
                            <button className={styles.closeModal} onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddTransaction} className={styles.modalForm}>
                            <div className={styles.formGroup}>
                                <label htmlFor="member">Member Name *</label>
                                <input
                                    type="text"
                                    id="member"
                                    required
                                    value={newTransaction.member}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, member: e.target.value })}
                                    placeholder="Enter member name"
                                />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="type">Transaction Type</label>
                                    <select
                                        id="type"
                                        value={newTransaction.type}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                                    >
                                        {transactionTypes.map(t => (
                                            <option key={t} value={t}>{getTypeLabel(t)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="amount">Amount (₹) *</label>
                                    <input
                                        type="number"
                                        id="amount"
                                        required
                                        min="0"
                                        value={newTransaction.amount}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="plan">Description / Plan *</label>
                                <input
                                    type="text"
                                    id="plan"
                                    required
                                    value={newTransaction.plan}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, plan: e.target.value })}
                                    placeholder="e.g. Gold Annual Membership"
                                />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="method">Payment Method</label>
                                    <select
                                        id="method"
                                        value={newTransaction.method}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, method: e.target.value })}
                                    >
                                        {paymentMethods.map(m => (
                                            <option key={m} value={m}>{m.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="status">Status</label>
                                    <select
                                        id="status"
                                        value={newTransaction.status}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, status: e.target.value as any })}
                                    >
                                        {statuses.map(s => (
                                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className={styles.modalActions}>
                                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Record Transaction
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
