import { Search, Filter, Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import styles from './AttendancePage.module.css'

export function AttendancePage() {
    // Today's date
    const today = 'December 11, 2024'

    // Check-in records for today
    const checkIns = [
        { id: '1', member: 'Rahul Sharma', time: '6:15 AM', checkOut: '8:30 AM', duration: '2h 15m', method: 'QR Code', trainer: 'Sarah M.' },
        { id: '2', member: 'Priya Patel', time: '6:45 AM', checkOut: '8:00 AM', duration: '1h 15m', method: 'QR Code', trainer: null },
        { id: '3', member: 'Amit Kumar', time: '7:00 AM', checkOut: null, duration: null, method: 'Manual', trainer: 'Mike T.' },
        { id: '4', member: 'Sneha Gupta', time: '7:30 AM', checkOut: '9:15 AM', duration: '1h 45m', method: 'QR Code', trainer: 'John D.' },
        { id: '5', member: 'Vikram Singh', time: '8:00 AM', checkOut: '10:00 AM', duration: '2h 0m', method: 'QR Code', trainer: null },
        { id: '6', member: 'Anita Desai', time: '9:30 AM', checkOut: null, duration: null, method: 'Biometric', trainer: 'Priya S.' },
        { id: '7', member: 'Rajesh Nair', time: '10:15 AM', checkOut: '11:45 AM', duration: '1h 30m', method: 'QR Code', trainer: null },
        { id: '8', member: 'Meera Iyer', time: '11:00 AM', checkOut: null, duration: null, method: 'QR Code', trainer: null },
        { id: '9', member: 'Suresh Menon', time: '12:30 PM', checkOut: null, duration: null, method: 'Manual', trainer: 'Mike T.' },
    ]

    // Hourly distribution for chart
    const hourlyData = [
        { hour: '6 AM', count: 18 },
        { hour: '7 AM', count: 32 },
        { hour: '8 AM', count: 28 },
        { hour: '9 AM', count: 15 },
        { hour: '10 AM', count: 12 },
        { hour: '11 AM', count: 8 },
        { hour: '12 PM', count: 22 },
        { hour: '1 PM', count: 18 },
        { hour: '5 PM', count: 35 },
        { hour: '6 PM', count: 42 },
        { hour: '7 PM', count: 38 },
        { hour: '8 PM', count: 25 },
    ]

    const maxCount = Math.max(...hourlyData.map(d => d.count))

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.dateNav}>
                    <Button variant="ghost" size="sm">←</Button>
                    <span className={styles.dateLabel}>
                        <Calendar size={18} /> {today}
                    </span>
                    <Button variant="ghost" size="sm">→</Button>
                </div>
                <div className={styles.headerActions}>
                    <Button variant="secondary" size="sm">
                        <Calendar size={16} /> View Calendar
                    </Button>
                    <Button size="sm">
                        <CheckCircle2 size={16} /> Manual Check-In
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <Card className={styles.statCard}>
                    <div className={styles.statIcon + ' ' + styles.gold}>👥</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>156</span>
                        <span className={styles.statLabel}>Total Check-ins</span>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statIcon + ' ' + styles.green}>✓</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>142</span>
                        <span className={styles.statLabel}>Checked Out</span>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statIcon + ' ' + styles.blue}>🏋️</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>14</span>
                        <span className={styles.statLabel}>Currently In Gym</span>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statIcon + ' ' + styles.purple}>⏱️</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>1h 42m</span>
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
                        <input type="text" placeholder="Search members..." className={styles.searchInput} />
                    </div>
                    <div className={styles.filterGroup}>
                        <select className={styles.select}>
                            <option value="">All Methods</option>
                            <option value="qr">QR Code</option>
                            <option value="manual">Manual</option>
                            <option value="biometric">Biometric</option>
                        </select>
                        <select className={styles.select}>
                            <option value="">All Status</option>
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
                            {checkIns.map((record) => (
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
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>
        </div>
    )
}
