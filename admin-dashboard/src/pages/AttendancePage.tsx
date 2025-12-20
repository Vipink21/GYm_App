import { useState, useMemo, useEffect } from 'react'
import { Search, Filter, Calendar, Clock, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import {
    format,
    addDays,
    subDays,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from 'date-fns'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ManualCheckInModal } from '../components/attendance/ManualCheckInModal'
import { Modal } from '../components/ui/Modal'
import styles from './AttendancePage.module.css'
import { useAuth } from '../contexts/AuthContext'
import { attendanceService } from '../services/attendanceService'

export function AttendancePage() {
    // Date State
    const [currentDate, setCurrentDate] = useState(new Date())
    const [showManualCheckIn, setShowManualCheckIn] = useState(false)
    const [showCalendar, setShowCalendar] = useState(false)
    const [calendarDate, setCalendarDate] = useState(new Date())

    // Filter State
    const [filters, setFilters] = useState({
        search: '',
        method: '',
        status: ''
    })

    // Data State
    const [allCheckIns, setCheckIns] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Auth
    const { user, userData } = useAuth()
    const userRole = userData?.role || 'member'

    // Fetch Data
    useEffect(() => {
        async function fetchAttendance() {
            if (!user) return
            setLoading(true)
            try {
                let data
                if (userRole === 'member') {
                    data = await attendanceService.getMemberAttendance(user.id)
                } else {
                    const gymId = userData?.gymId || user.id
                    data = await attendanceService.getAttendance(gymId)
                }

                const mapped = data.map(d => ({
                    id: d.id,
                    member: d.member_name,
                    time: d.check_in_time,
                    checkOut: d.check_out_time,
                    duration: d.duration,
                    method: d.method,
                    trainer: d.trainer_name
                }))
                setCheckIns(mapped)
            } catch (e) {
                console.error('Error fetching attendance:', e)
            } finally {
                setLoading(false)
            }
        }
        fetchAttendance()
    }, [user, userData, userRole])

    // Hourly distribution for chart
    const hourlyData = useMemo(() => {
        return [
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
    }, [])

    const maxCount = Math.max(...hourlyData.map(d => d.count))

    // Handlers
    const handlePrevDate = () => setCurrentDate(prev => subDays(prev, 1))
    const handleNextDate = () => setCurrentDate(prev => addDays(prev, 1))

    // Calendar Modal Handlers
    const handleCalendarPrev = () => setCalendarDate(prev => subMonths(prev, 1))
    const handleCalendarNext = () => setCalendarDate(prev => addMonths(prev, 1))

    const handleDateSelect = (date: Date) => {
        setCurrentDate(date)
        setShowCalendar(false)
    }

    const handleManualCheckIn = async (data: any) => {
        try {
            if (!user) return
            const record = await attendanceService.checkIn({
                gym_id: userData?.gymId || user.id,
                member_id: data.memberId,
                member_name: data.member_name,
                trainer_name: data.trainerName,
                method: 'Manual'
            })

            const newCheckIn = {
                id: record.id,
                member: record.member_name || data.member_name || 'Member',
                time: new Date(record.check_in_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                checkOut: null,
                duration: null,
                method: record.method || 'Manual',
                trainer: record.trainer_name || data.trainerName
            }
            setCheckIns([newCheckIn, ...allCheckIns])
            setShowManualCheckIn(false)
        } catch (e) { console.error('Error in manual check-in:', e) }
    }

    const clearFilters = () => {
        setFilters({ search: '', method: '', status: '' })
    }

    // Filter Logic
    const filteredCheckIns = useMemo(() => {
        return allCheckIns.filter(record => {
            const matchesSearch = record.member.toLowerCase().includes(filters.search.toLowerCase())
            const matchesMethod = filters.method === '' || record.method.toLowerCase() === filters.method.toLowerCase()
            const matchesStatus = filters.status === ''
                ? true
                : filters.status === 'in' ? !record.checkOut : !!record.checkOut

            return matchesSearch && matchesMethod && matchesStatus
        })
    }, [allCheckIns, filters])

    // Calendar Grid Generation
    const calendarGrid = useMemo(() => {
        const start = startOfWeek(startOfMonth(calendarDate), { weekStartsOn: 1 })
        const end = endOfWeek(endOfMonth(calendarDate), { weekStartsOn: 1 })
        return eachDayOfInterval({ start, end })
    }, [calendarDate])

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading attendance...</div>
    }

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.dateNav}>
                    <Button variant="ghost" size="sm" onClick={handlePrevDate}>
                        <ChevronLeft size={18} />
                    </Button>
                    <span className={styles.dateLabel}>
                        <Calendar size={18} /> {format(currentDate, 'MMMM d, yyyy')}
                    </span>
                    <Button variant="ghost" size="sm" onClick={handleNextDate}>
                        <ChevronRight size={18} />
                    </Button>
                </div>
                {userRole !== 'member' && (
                    <div className={styles.headerActions}>
                        <Button variant="secondary" size="sm" onClick={() => {
                            setCalendarDate(currentDate)
                            setShowCalendar(true)
                        }}>
                            <Calendar size={16} /> View Calendar
                        </Button>
                        <Button size="sm" onClick={() => setShowManualCheckIn(true)}>
                            <CheckCircle2 size={16} /> Manual Check-In
                        </Button>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <Card className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.gold}`}>👥</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{filteredCheckIns.length}</span>
                        <span className={styles.statLabel}>Total Logs</span>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.green}`}>✓</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>
                            {filteredCheckIns.filter(r => r.checkOut).length}
                        </span>
                        <span className={styles.statLabel}>Checked Out</span>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.blue}`}>🏋️</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>
                            {filteredCheckIns.filter(r => !r.checkOut).length}
                        </span>
                        <span className={styles.statLabel}>Currently Present</span>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.purple}`}>⏱️</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>1h 42m</span>
                        <span className={styles.statLabel}>Avg Duration</span>
                    </div>
                </Card>
            </div>

            {/* Hourly Distribution (only for staff) */}
            {userRole !== 'member' && (
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
            )}

            {/* Filters & Table */}
            <div className={styles.tableSection}>
                <div className={styles.filters}>
                    <div className={styles.searchWrapper}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search records..."
                            className={styles.searchInput}
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        <select
                            className={styles.select}
                            value={filters.method}
                            onChange={(e) => setFilters(prev => ({ ...prev, method: e.target.value }))}
                        >
                            <option value="">All Methods</option>
                            <option value="qr code">QR Code</option>
                            <option value="manual">Manual</option>
                            <option value="biometric">Biometric</option>
                        </select>
                        <select
                            className={styles.select}
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        >
                            <option value="">All Status</option>
                            <option value="in">In Progress</option>
                            <option value="out">Completed</option>
                        </select>
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            <Filter size={16} /> Clear
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
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCheckIns.length > 0 ? (
                                filteredCheckIns.map((record) => (
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
                                            {record.checkOut ? (
                                                <span className={styles.statusOut}>
                                                    <CheckCircle2 size={14} /> Completed
                                                </span>
                                            ) : (
                                                <span className={styles.statusIn}>
                                                    <span className={styles.pulse}></span> Active
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                        No attendance records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </Card>
            </div>

            {userRole !== 'member' && (
                <ManualCheckInModal
                    isOpen={showManualCheckIn}
                    onClose={() => setShowManualCheckIn(false)}
                    onSubmit={handleManualCheckIn}
                />
            )}

            <Modal
                isOpen={showCalendar}
                onClose={() => setShowCalendar(false)}
                title="Select Date"
            >
                <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <Button variant="ghost" size="sm" onClick={handleCalendarPrev}>
                            <ChevronLeft size={20} />
                        </Button>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{format(calendarDate, 'MMMM yyyy')}</h3>
                        <Button variant="ghost" size="sm" onClick={handleCalendarNext}>
                            <ChevronRight size={20} />
                        </Button>
                    </div>

                    <div className={styles.calendarGrid}>
                        {weekDays.map(day => (
                            <div key={day} className={styles.calendarHeaderCell}>
                                {day}
                            </div>
                        ))}
                        {calendarGrid.map(day => (
                            <div
                                key={day.toISOString()}
                                className={`
                                        ${styles.calendarDay} 
                                        ${!isSameMonth(day, calendarDate) ? styles.otherMonth : ''}
                                        ${isSameDay(day, currentDate) ? styles.selected : ''}
                                        ${isSameDay(day, new Date()) ? styles.today : ''}
                                    `}
                                onClick={() => handleDateSelect(day)}
                            >
                                <span className={styles.dayNumber}>{format(day, 'd')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    )
}
