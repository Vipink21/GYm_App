import { useState, useMemo } from 'react'
import { Search, Filter, Download, CreditCard, Banknote, Smartphone, Building, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import styles from './PaymentsPage.module.css'
import { useAuth } from '../contexts/AuthContext'
import { paymentService } from '../services/paymentService'
import { useEffect } from 'react'

export function PaymentsPage() {
    // Data State
    const { user, userData } = useAuth()
    const [allTransactions, setTransactions] = useState<any[]>([])

    useEffect(() => {
        async function fetchPayments() {
            if (!user) return
            try {
                const gymId = userData?.gymId || user.id
                if (gymId) {
                    const data = await paymentService.getTransactions(gymId)
                    setTransactions(data)
                }
            } catch (e) { console.error(e) }
        }
        fetchPayments()
    }, [user, userData])

    const [filters, setFilters] = useState({
        search: '',
        type: '',
        status: '',
        method: ''
    })

    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 8

    // Filter Logic
    const filteredTransactions = useMemo(() => {
        return allTransactions.filter(txn => {
            const matchesSearch = txn.member.toLowerCase().includes(filters.search.toLowerCase()) ||
                txn.id.toLowerCase().includes(filters.search.toLowerCase())
            const matchesType = filters.type === '' || txn.type === filters.type
            const matchesStatus = filters.status === '' || txn.status === filters.status
            const matchesMethod = filters.method === '' || txn.method === filters.method

            return matchesSearch && matchesType && matchesStatus && matchesMethod
        })
    }, [filters, allTransactions])

    // Pagination Logic
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage)
        }
    }

    const handleExport = () => {
        const headers = ['Transaction ID', 'Member', 'Type', 'Plan', 'Amount', 'Method', 'Status', 'Date', 'Time']
        const csvContent = [
            headers.join(','),
            ...filteredTransactions.map(txn => [
                txn.id,
                txn.member,
                txn.type,
                txn.plan,
                txn.amount,
                txn.method,
                txn.status,
                txn.date,
                txn.time
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
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
            default: return type
        }
    }

    return (
        <div className={styles.page}>
            {/* Revenue Stats */}
            <div className={styles.statsGrid}>
                <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                        <span className={styles.statLabel}>Today's Revenue</span>
                        <span className={styles.statValue}>₹27,498</span>
                        <span className={styles.statChange}>+12% from yesterday</span>
                    </div>
                    <div className={`${styles.statIcon} ${styles.gold}`}>₹</div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                        <span className={styles.statLabel}>This Week</span>
                        <span className={styles.statValue}>₹1,24,890</span>
                        <span className={styles.statChange}>+8% from last week</span>
                    </div>
                    <div className={`${styles.statIcon} ${styles.blue}`}>📊</div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                        <span className={styles.statLabel}>This Month</span>
                        <span className={styles.statValue}>₹4,82,350</span>
                        <span className={styles.statChange}>+15% from last month</span>
                    </div>
                    <div className={`${styles.statIcon} ${styles.green}`}>📈</div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                        <span className={styles.statLabel}>Pending</span>
                        <span className={styles.statValue}>₹49,999</span>
                        <span className={styles.statSub}>2 transactions</span>
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
                        value={filters.search}
                        onChange={(e) => {
                            setFilters(prev => ({ ...prev, search: e.target.value }))
                            setCurrentPage(1)
                        }}
                    />
                </div>
                <div className={styles.filterGroup}>
                    <select
                        className={styles.select}
                        value={filters.type}
                        onChange={(e) => {
                            setFilters(prev => ({ ...prev, type: e.target.value }))
                            setCurrentPage(1)
                        }}
                    >
                        <option value="">All Types</option>
                        <option value="membership">Membership</option>
                        <option value="class_pack">Class Pack</option>
                        <option value="personal_training">Personal Training</option>
                        <option value="merchandise">Merchandise</option>
                    </select>
                    <select
                        className={styles.select}
                        value={filters.status}
                        onChange={(e) => {
                            setFilters(prev => ({ ...prev, status: e.target.value }))
                            setCurrentPage(1)
                        }}
                    >
                        <option value="">All Status</option>
                        <option value="success">Success</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                    <select
                        className={styles.select}
                        value={filters.method}
                        onChange={(e) => {
                            setFilters(prev => ({ ...prev, method: e.target.value }))
                            setCurrentPage(1)
                        }}
                    >
                        <option value="">All Methods</option>
                        <option value="razorpay">Razorpay</option>
                        <option value="upi">UPI</option>
                        <option value="card">Card</option>
                        <option value="cash">Cash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                    </select>
                    <Button variant="ghost" size="sm" onClick={() => setFilters({ search: '', type: '', status: '', method: '' })}>
                        <Filter size={16} /> Clear Filters
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleExport}>
                        <Download size={16} /> Export
                    </Button>
                </div>
            </div>

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
                        {paginatedTransactions.length > 0 ? (
                            paginatedTransactions.map((txn) => (
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
                        ) : (
                            <tr>
                                <td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>
                                    No transactions found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>

            {/* Pagination */}
            <div className={styles.pagination}>
                <span className={styles.pageInfo}>
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredTransactions.length)}-{Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
                </span>
                <div className={styles.pageButtons}>
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                    >
                        <ChevronLeft size={16} /> Previous
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                            key={page}
                            variant="ghost"
                            size="sm"
                            className={currentPage === page ? styles.activePage : ''}
                            onClick={() => handlePageChange(page)}
                        >
                            {page}
                        </Button>
                    ))}

                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => handlePageChange(currentPage + 1)}
                    >
                        Next <ChevronRight size={16} />
                    </Button>
                </div>
            </div>
        </div>
    )
}
