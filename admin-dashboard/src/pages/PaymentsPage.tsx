import { Search, Filter, Download, CreditCard, Banknote, Smartphone, Building } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import styles from './PaymentsPage.module.css'

export function PaymentsPage() {
    // Sample transactions data
    const transactions = [
        { id: 'TXN001', member: 'Rahul Sharma', type: 'membership', plan: 'Gold Annual', amount: 24999, method: 'razorpay', status: 'success', date: 'Dec 11, 2024', time: '10:34 AM' },
        { id: 'TXN002', member: 'Priya Patel', type: 'membership', plan: 'Silver Monthly', amount: 2499, method: 'upi', status: 'success', date: 'Dec 11, 2024', time: '09:15 AM' },
        { id: 'TXN003', member: 'Amit Kumar', type: 'class_pack', plan: '10 Class Pack', amount: 4999, method: 'card', status: 'success', date: 'Dec 10, 2024', time: '06:45 PM' },
        { id: 'TXN004', member: 'Sneha Gupta', type: 'membership', plan: 'Platinum', amount: 49999, method: 'bank_transfer', status: 'pending', date: 'Dec 10, 2024', time: '04:20 PM' },
        { id: 'TXN005', member: 'Vikram Singh', type: 'personal_training', plan: 'PT - 12 Sessions', amount: 15999, method: 'cash', status: 'success', date: 'Dec 10, 2024', time: '11:30 AM' },
        { id: 'TXN006', member: 'Anita Desai', type: 'membership', plan: 'Gold Annual', amount: 24999, method: 'razorpay', status: 'failed', date: 'Dec 9, 2024', time: '08:50 PM' },
        { id: 'TXN007', member: 'Rajesh Nair', type: 'membership', plan: 'Silver Monthly', amount: 2499, method: 'upi', status: 'success', date: 'Dec 9, 2024', time: '07:10 AM' },
        { id: 'TXN008', member: 'Meera Iyer', type: 'merchandise', plan: 'Gym Bag + T-Shirt', amount: 1999, method: 'cash', status: 'success', date: 'Dec 8, 2024', time: '05:45 PM' },
    ]

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
                    <input type="text" placeholder="Search by member or transaction ID..." className={styles.searchInput} />
                </div>
                <div className={styles.filterGroup}>
                    <select className={styles.select}>
                        <option value="">All Types</option>
                        <option value="membership">Membership</option>
                        <option value="class_pack">Class Pack</option>
                        <option value="personal_training">Personal Training</option>
                        <option value="merchandise">Merchandise</option>
                    </select>
                    <select className={styles.select}>
                        <option value="">All Status</option>
                        <option value="success">Success</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                    <select className={styles.select}>
                        <option value="">All Methods</option>
                        <option value="razorpay">Razorpay</option>
                        <option value="upi">UPI</option>
                        <option value="card">Card</option>
                        <option value="cash">Cash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                    </select>
                    <Button variant="ghost" size="sm">
                        <Filter size={16} /> More Filters
                    </Button>
                    <Button variant="secondary" size="sm">
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
                        {transactions.map((txn) => (
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
                        ))}
                    </tbody>
                </table>
            </Card>

            {/* Pagination */}
            <div className={styles.pagination}>
                <span className={styles.pageInfo}>Showing 1-8 of 156 transactions</span>
                <div className={styles.pageButtons}>
                    <Button variant="ghost" size="sm" disabled>Previous</Button>
                    <Button variant="ghost" size="sm" className={styles.activePage}>1</Button>
                    <Button variant="ghost" size="sm">2</Button>
                    <Button variant="ghost" size="sm">3</Button>
                    <Button variant="ghost" size="sm">Next</Button>
                </div>
            </div>
        </div>
    )
}
