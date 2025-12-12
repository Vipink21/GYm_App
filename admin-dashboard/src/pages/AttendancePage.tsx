import { useState, useMemo } from 'react'
import { Search, Filter, Calendar, Clock, CheckCircle2, XCircle, Plus, X, ChevronDown } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import styles from './AttendancePage.module.css'

interface AttendanceRecord {
    id: string
    member: string
    time: string
    checkOut: string | null
    duration: string | null
    method: string
    trainer: string | null
    status: 'in' | 'out'
    date: string
}

// Helper to format date
const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const initialRecords: AttendanceRecord[] = [
    { id: '1', member: 'Rahul Sharma', time: '6:15 AM', checkOut: '8:30 AM', duration: '2h 15m', method: 'QR Code', trainer: 'Sarah M.', status: 'out', date: formatDate(new Date()) },
    { id: '2', member: 'Priya Patel', time: '6:45 AM', checkOut: '8:00 AM', duration: '1h 15m', method: 'QR Code', trainer: null, status: 'out', date: formatDate(new Date()) },
    { id: '3', member: 'Amit Kumar', time: '7:00 AM', checkOut: null, duration: null, method: 'Manual', trainer: 'Mike T.', status: 'in', date: formatDate(new Date()) },
    { id: '4', member: 'Sneha Gupta', time: '7:30 AM', checkOut: '9:15 AM', duration: '1h 45m', method: 'QR Code', trainer: 'John D.', status: 'out', date: formatDate(new Date()) },
    { id: '5', member: 'Vikram Singh', time: '8:00 AM', checkOut: '10:00 AM', duration: '2h 0m', method: 'QR Code', trainer: null, status: 'out', date: formatDate(new Date()) },
    { id: '6', member: 'Anita Desai', time: '9:30 AM', checkOut: null, duration: null, method: 'Biometric', trainer: 'Priya S.', status: 'in', date: formatDate(new Date()) },
    { id: '7', member: 'Rajesh Nair', time: '10:15 AM', checkOut: '11:45 AM', duration: '1h 30m', method: 'QR Code', trainer: null, status: 'out', date: formatDate(new Date()) },
    { id: '8', member: 'Meera Iyer', time: '11:00 AM', checkOut: null, duration: null, method: 'QR Code', trainer: null, status: 'in', date: formatDate(new Date()) },
    { id: '9', member: 'Suresh Menon', time: '12:30 PM', checkOut: null, duration: null, method: 'Manual', trainer: 'Mike T.', status: 'in', date: formatDate(new Date()) },
]

const methods = ['All Methods', 'QR Code', 'Manual', 'Biometric']
const statuses = ['All Status', 'in', 'out']

export function AttendancePage() {
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [records, setRecords] = useState<AttendanceRecord[]>(initialRecords)
    const [searchQuery, setSearchQuery] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)

    // Filter states
    const [selectedMethod, setSelectedMethod] = useState('All Methods')
    const [selectedStatus, setSelectedStatus] = useState('All Status')

    // New check-in form state
    const [newCheckIn, setNewCheckIn] = useState({
        member: '',
        time: '9:00 AM',
        method: 'Manual',
        trainer: ''
    })

    // Computed stats
    const stats = useMemo(() => {
        const total = records.length
        const checkedOut = records.filter(r => r.status === 'out').length
        const currentIn = records.filter(r => r.status === 'in').length

        // Mock avg duration calculation
        const times = records
            .filter(r => r.duration)
            .map(r => {
                const [h, m] = r.duration!.replace('m', '').split('h ').map(Number)
                return h * 60 + m
            })
        const avgMins = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0
        const avgH = Math.floor(avgMins / 60)
        const avgM = Math.round(avgMins % 60)

        return {
            total,
            checkedOut,
            currentIn,
            avgDuration: `${avgH}h ${avgM}m`
        }
    }, [records])

    // Filter records
    const filteredRecords = useMemo(() => {
        return records.filter(record => {
            const matchesSearch = record.member.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesMethod = selectedMethod === 'All Methods' || record.method === selectedMethod
            const matchesStatus = selectedStatus === 'All Status' || record.status === selectedStatus

            // In a real app, filtering by date would happen here
            // const matchesDate = record.date === formatDate(selectedDate)

            return matchesSearch && matchesMethod && matchesStatus
        })
    }, [records, searchQuery, selectedMethod, selectedStatus, selectedDate])

    // Hourly distribution for chart (mocked relative to total)
    const hourlyData = useMemo(() => {
        return [
            { hour: '6 AM', count: Math.floor(stats.total * 0.15) },
            { hour: '7 AM', count: Math.floor(stats.total * 0.25) },
            { hour: '8 AM', count: Math.floor(stats.total * 0.20) },
            { hour: '9 AM', count: Math.floor(stats.total * 0.10) },
            { hour: '10 AM', count: Math.floor(stats.total * 0.08) },
            { hour: '11 AM', count: Math.floor(stats.total * 0.05) },
            { hour: '12 PM', count: Math.floor(stats.total * 0.15) },
            { hour: '1 PM', count: 18 },
            { hour: '5 PM', count: 35 },
            { hour: '6 PM', count: 42 },
            { hour: '7 PM', count: 38 },
            { hour: '8 PM', count: 25 },
        ]
    }, [stats.total])

    const maxCount = Math.max(...hourlyData.map(d => d.count))

    const handleDateChange = (days: number) => {
        const newDate = new Date(selectedDate)
        newDate.setDate(selectedDate.getDate() + days)
        setSelectedDate(newDate)
    }

    const handleAddCheckIn = (e: React.FormEvent) => {
        e.preventDefault()
        const record: AttendanceRecord = {
            id: String(Date.now()),
            member: newCheckIn.member,
            time: newCheckIn.time,
            checkOut: null,
            duration: null,
            method: newCheckIn.method,
            trainer: newCheckIn.trainer || null,
            status: 'in',
            date: formatDate(selectedDate)
        }
        setRecords([record, ...records])
        setNewCheckIn({ member: '', time: '9:00 AM', method: 'Manual', trainer: '' })
        setShowAddModal(false)
    }

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.dateNav}>
                    <Button variant="ghost" size="sm" onClick={() => handleDateChange(-1)}>←</Button>
                    <span className={styles.dateLabel}>
                        <Calendar size={18} /> {formatDate(selectedDate)}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => handleDateChange(1)}>→</Button>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date())}>
                        Today
                    </Button>
                </div>
                <div className={styles.headerActions}>
                    <Button variant="secondary" size="sm">
                        <Calendar size={16} /> View Calendar
                    </Button>
                    <Button size="sm" onClick={() => setShowAddModal(true)}>
                        <CheckCircle2 size={16} /> Manual Check-In
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <Card className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.gold}`}>👥</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats.total}</span>
                        <span className={styles.statLabel}>Total Check-ins</span>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.green}`}>✓</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats.checkedOut}</span>
                        <span className={styles.statLabel}>Checked Out</span>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.blue}`}>🏋️</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats.currentIn}</span>
                        <span className={styles.statLabel}>Currently In Gym</span>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.purple}`}>⏱️</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats.avgDuration}</span>
                        <span className={styles.statLabel}>Avg Duration</span>
                    </div>
                </Card>
            </div>

            {/* Hourly Distribution */}
            <Card>
                <div className={styles.chartHeader}>
                    <h3>Hourly Distribution</h3>
                    <span className={styles.chartSubtitle}>Check-ins by hour</span>
                </div>
                <div className={styles.chart}>
                    {hourlyData.map((data) => (
                        <div key={data.hour} className={styles.chartBar}>
                            <div
                                className={styles.bar}
                                style={{ height: `${(data.count / maxCount) * 100}%` }}
                            >
                                <span className={styles.barValue}>{data.count}</span>
                            </div>
                            <span className={styles.barLabel}>{data.hour}</span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Filters & Table */}
            <div className={styles.tableSection}>
                <div className={styles.filters}>
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
                            <button className={styles.clearSearch} onClick={() => setSearchQuery('')}>
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <div className={styles.filterGroup}>
                        <select
                            className={styles.select}
                            value={selectedMethod}
                            onChange={(e) => setSelectedMethod(e.target.value)}
                        >
                            {methods.map(method => (
                                <option key={method} value={method}>{method}</option>
                            ))}
                        </select>
                        <select
                            className={styles.select}
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="All Status">All Status</option>
                            <option value="in">Currently In</option>
                            <option value="out">Checked Out</option>
                        </select>
                        <Button variant="ghost" size="sm">
                            <Filter size={16} /> More
                        </Button>
                    </div>
                </div>

                <Card padding="sm">
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Duration</th>
                                <th>Method</th>
                                <th>Trainer</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className={styles.emptyState}>
                                        No attendance records found
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => (
                                    <tr key={record.id}>
                                        <td>
                                            <div className={styles.memberCell}>
                                                <div className={styles.avatar}>{record.member.charAt(0)}</div>
                                                <span>{record.member}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.timeCell}>
                                                <Clock size={14} />
                                                {record.time}
                                            </div>
                                        </td>
                                        <td>
                                            {record.checkOut ? (
                                                <div className={styles.timeCell}>
                                                    <Clock size={14} />
                                                    {record.checkOut}
                                                </div>
                                            ) : (
                                                <span className={styles.pending}>—</span>
                                            )}
                                        </td>
                                        <td>
                                            {record.duration ? (
                                                <span className={styles.duration}>{record.duration}</span>
                                            ) : (
                                                <span className={styles.pending}>In progress</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={styles.methodTag}>{record.method}</span>
                                        </td>
                                        <td>
                                            {record.trainer || <span className={styles.noTrainer}>—</span>}
                                        </td>
                                        <td>
                                            {record.checkOut ? (
                                                <span className={styles.statusOut}>
                                                    <CheckCircle2 size={14} /> Out
                                                </span>
                                            ) : (
                                                <span className={styles.statusIn}>
                                                    <span className={styles.pulse}></span> In Gym
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </Card>
            </div>

            {/* Manual Check-In Modal */}
            {showAddModal && (
                <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Manual Check-In</h2>
                            <button className={styles.closeModal} onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddCheckIn} className={styles.modalForm}>
                            <div className={styles.formGroup}>
                                <label htmlFor="member">Member Name *</label>
                                <input
                                    type="text"
                                    id="member"
                                    required
                                    value={newCheckIn.member}
                                    onChange={(e) => setNewCheckIn({ ...newCheckIn, member: e.target.value })}
                                    placeholder="Enter member name"
                                />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="time">Check-In Time *</label>
                                    <input
                                        type="text"
                                        id="time"
                                        required
                                        value={newCheckIn.time}
                                        onChange={(e) => setNewCheckIn({ ...newCheckIn, time: e.target.value })}
                                        placeholder="e.g. 9:00 AM"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="method">Method</label>
                                    <select
                                        id="method"
                                        value={newCheckIn.method}
                                        onChange={(e) => setNewCheckIn({ ...newCheckIn, method: e.target.value })}
                                    >
                                        {methods.filter(m => m !== 'All Methods').map(method => (
                                            <option key={method} value={method}>{method}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="trainer">Assigned Trainer (Optional)</label>
                                <input
                                    type="text"
                                    id="trainer"
                                    value={newCheckIn.trainer}
                                    onChange={(e) => setNewCheckIn({ ...newCheckIn, trainer: e.target.value })}
                                    placeholder="Select trainer"
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Check In
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
