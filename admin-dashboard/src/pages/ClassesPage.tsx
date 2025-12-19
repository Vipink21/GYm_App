import { useState, useEffect } from 'react'
import { Plus, Calendar, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, addMonths, subMonths, isSameMonth, isSameDay, addDays } from 'date-fns'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import styles from './ClassesPage.module.css'
import { useAuth } from '../contexts/AuthContext'
import { classService } from '../services/classService'
import { showError, showSuccess } from '../utils/swal'

interface GymClass {
    id: string
    class_name: string
    start_time: string // Format "06:00 AM" or "06:00"
    duration: number
    trainer_name: string
    room: string
    capacity: number
    booked: number
    day_of_week: number // 0 = Mon, 6 = Sun to match frontend logic? OR 0=Sun. 
    // Frontend code uses 0-6. Let's assume 0=Mon for consistency with week view.
    color: string
}

// Helper to group classes
const groupClasses = (classes: GymClass[]) => {
    const morning: GymClass[] = []
    const afternoon: GymClass[] = []
    const evening: GymClass[] = []

    classes.forEach(cls => {
        // Simple logic: < 12 = morning, < 17 = afternoon, else evening
        // Assumes start_time string has AM/PM or 24h. Let's assume standard 'HH:MM' or 'HH:MM AM/PM'
        const timeLower = cls.start_time.toLowerCase()
        if (timeLower.includes('am') || (parseInt(cls.start_time) < 12 && !timeLower.includes('pm'))) {
            morning.push(cls)
        } else if (parseInt(cls.start_time) < 17 || (timeLower.includes('pm') && parseInt(cls.start_time) < 5)) {
            afternoon.push(cls)
        } else {
            evening.push(cls)
        }
    })
    return { morning, afternoon, evening }
}

export function ClassesPage() {
    const { user } = useAuth()
    const [schedule, setSchedule] = useState({ morning: [] as GymClass[], afternoon: [] as GymClass[], evening: [] as GymClass[] })
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // New class form state
    const [newClass, setNewClass] = useState({
        class_name: '',
        start_time: '9:00 AM',
        duration: 60,
        trainer_name: 'Sarah M.',
        room: 'Studio A',
        capacity: 20,
        day_of_week: 0,
        color: 'blue'
    })

    useEffect(() => {
        async function fetchClasses() {
            if (!user) return
            try {
                const gymId = user.user_metadata?.gym_id || user.id // Fallback
                // In real app use userData.gymId but we need to fetch it or rely on auth context providing it.
                // Assuming auth context has it.

                const data = await classService.getClasses(gymId)

                // Map DB classes to UI format
                // Note: This logic assumes classes are recurring or we filter by date
                // For now, we allow all classes to show up, mapped to their day of week
                const mappedClasses: GymClass[] = data.map(cls => {
                    const date = new Date(cls.schedule_time)
                    return {
                        id: cls.id,
                        class_name: cls.name,
                        start_time: format(date, 'h:mm a'),
                        duration: cls.duration_min,
                        trainer_name: cls.trainer_name,
                        room: 'Main Studio', // Default or add to DB
                        capacity: cls.capacity,
                        booked: cls.enrolled,
                        day_of_week: (date.getDay() + 6) % 7, // Convert Sun=0..Sat=6 to Mon=0..Sun=6
                        color: 'blue' // Default or dynamic
                    }
                })

                setSchedule(groupClasses(mappedClasses))
            } catch (err) {
                console.error('Error fetching classes:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchClasses()
    }, [user])

    const allClasses = [...schedule.morning, ...schedule.afternoon, ...schedule.evening]

    // Navigation handlers
    const handlePrev = () => {
        if (viewMode === 'week') {
            setCurrentDate(prev => addDays(prev, -7))
        } else {
            setCurrentDate(prev => subMonths(prev, 1))
        }
    }

    const handleNext = () => {
        if (viewMode === 'week') {
            setCurrentDate(prev => addDays(prev, 7))
        } else {
            setCurrentDate(prev => addMonths(prev, 1))
        }
    }

    const getWeekLabel = () => {
        if (viewMode === 'month') {
            return format(currentDate, 'MMMM yyyy')
        }
        const start = startOfWeek(currentDate, { weekStartsOn: 1 })
        const end = endOfWeek(currentDate, { weekStartsOn: 1 })
        return `${format(start, 'MMMM d')} - ${format(end, 'd, yyyy')}`
    }

    // Week View Data
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const getWeekDays = () => {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 })
        return weekDays.map((_, i) => addDays(start, i))
    }
    const currentWeekDays = getWeekDays()
    const today = new Date()

    // Month View Data
    const getMonthDays = () => {
        const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 })
        const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })
        return eachDayOfInterval({ start, end })
    }
    const monthDays = getMonthDays()

    // Compute stats
    const totalBookings = allClasses.reduce((sum, c) => sum + c.booked, 0)
    const totalCapacity = allClasses.reduce((sum, c) => sum + c.capacity, 0)
    const avgCapacity = totalCapacity ? Math.round((totalBookings / totalCapacity) * 100) : 0
    const fullyBooked = allClasses.filter(c => c.booked >= c.capacity).length

    const getCapacityStatus = (booked: number, capacity: number) => {
        if (booked >= capacity) return 'full'
        if (booked >= capacity * 0.8) return 'almost'
        return 'available'
    }

    const handleAddClass = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setIsSubmitting(true)
        try {
            // Calculate schedule time for today + day_of_week? 
            // Or just use today for simplicity in this "quick add" form
            // Ideally prompt user for Date.
            const today = new Date()
            // Just use next occurrence of that day?
            // For MVP, just assume today at the given time.
            const [timeStr, period] = newClass.start_time.split(' ') // e.g. "9:00 AM"
            const [hours, mins] = timeStr.split(':').map(Number)
            let hour = hours
            if (period === 'PM' && hour < 12) hour += 12
            if (period === 'AM' && hour === 12) hour = 0

            const scheduleTime = new Date(today)
            scheduleTime.setHours(hour, mins, 0, 0)

            const gymClassData = {
                gym_id: user.user_metadata?.gym_id || user.id,
                name: newClass.class_name,
                description: '',
                trainer_id: null, // Need to select trainer
                schedule_time: scheduleTime.toISOString(),
                duration_min: newClass.duration,
                capacity: newClass.capacity,
                status: 'scheduled'
            }

            const created = await classService.createClass(gymClassData)

            // Optimistic add
            const uiClass: GymClass = {
                id: created.id,
                class_name: created.name,
                start_time: newClass.start_time,
                duration: created.duration_min,
                trainer_name: 'Unassigned',
                room: 'Main Studio',
                capacity: created.capacity,
                booked: 0,
                day_of_week: (today.getDay() + 6) % 7,
                color: 'blue'
            }

            const newAll = [...allClasses, uiClass]
            setSchedule(groupClasses(newAll))
            showSuccess('Class Added', 'New class has been added to the schedule.')
            setShowAddModal(false)
        } catch (err: any) {
            console.error('Error adding class:', err)
            showError('Error', err.message || 'Failed to add class')
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderClassCard = (cls: GymClass) => {
        const status = getCapacityStatus(cls.booked, cls.capacity)
        return (
            <div
                key={cls.id}
                className={`${styles.classCard} ${styles[cls.color]}`}
                style={{ gridColumn: cls.day_of_week + 1 }}
            >
                <div className={styles.classHeader}>
                    <span className={styles.className}>{cls.class_name}</span>
                    <span className={`${styles.capacityBadge} ${styles[status]}`}>
                        {cls.booked}/{cls.capacity}
                    </span>
                </div>
                <div className={styles.classDetails}>
                    <span className={styles.classTime}>
                        <Clock size={12} /> {cls.start_time} • {cls.duration}min
                    </span>
                    <span className={styles.classTrainer}>{cls.trainer_name}</span>
                    <span className={styles.classRoom}>{cls.room}</span>
                </div>
            </div>
        )
    }

    const renderMonthDay = (date: Date) => {
        // Find classes for this day (Mock: using day of week 0-6)
        // In a real app, you'd match specific dates. Here we just map Mon-Sun patterns repeatedly.
        const dayIndex = (date.getDay() + 6) % 7 // Convert Sun=0..Sat=6 to Mon=0..Sun=6
        const dayClasses = allClasses.filter(c => c.day_of_week === dayIndex)

        return (
            <div
                key={date.toISOString()}
                className={`${styles.monthDay} ${!isSameMonth(date, currentDate) ? styles.otherMonth : ''}`}
            >
                <div className={`${styles.monthDayHeader} ${isSameDay(date, today) ? styles.today : ''}`}>
                    {format(date, 'd')}
                </div>
                <div className={styles.monthDayContent}>
                    {dayClasses.map(cls => (
                        <div key={cls.id} className={`${styles.monthClassDot} ${styles[cls.color]}`} title={`${cls.start_time} - ${cls.class_name}`} />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.weekNav}>
                    <Button variant="ghost" size="sm" onClick={handlePrev}>
                        <ChevronLeft size={18} />
                    </Button>
                    <span className={styles.weekLabel}>
                        <Calendar size={18} /> {getWeekLabel()}
                    </span>
                    <Button variant="ghost" size="sm" onClick={handleNext}>
                        <ChevronRight size={18} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>
                        Today
                    </Button>
                </div>
                <div className={styles.headerActions}>
                    <Button
                        variant={viewMode === 'month' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setViewMode(viewMode === 'week' ? 'month' : 'week')}
                    >
                        <Calendar size={16} /> {viewMode === 'week' ? 'Month View' : 'Week View'}
                    </Button>
                    <Button size="sm" onClick={() => setShowAddModal(true)}>
                        <Plus size={16} /> Add Class
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className={styles.statsRow}>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{allClasses.length}</span>
                    <span className={styles.statLabel}>Classes This Week</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{totalBookings}</span>
                    <span className={styles.statLabel}>Total Bookings</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{avgCapacity}%</span>
                    <span className={styles.statLabel}>Avg Capacity</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{fullyBooked}</span>
                    <span className={styles.statLabel}>Fully Booked</span>
                </div>
            </div>

            {/* Schedule Grid */}
            <Card padding="md">
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading schedule...</div>
                ) : viewMode === 'week' ? (
                    <>
                        {/* Days Header */}
                        <div className={styles.daysHeader}>
                            <div className={styles.timeColumn}></div>
                            {weekDays.map((day, i) => (
                                <div
                                    key={day}
                                    className={`${styles.dayColumn} ${isSameDay(currentWeekDays[i], today) ? styles.today : ''}`}
                                >
                                    <span className={styles.dayName}>{day}</span>
                                    <span className={styles.dayDate}>{format(currentWeekDays[i], 'd')}</span>
                                </div>
                            ))}
                        </div>

                        {/* Time Slots */}
                        <div className={styles.scheduleBody}>
                            {/* Morning */}
                            <div className={styles.timeBlock}>
                                <div className={styles.timeLabel}>
                                    <span>Morning</span>
                                    <span className={styles.timeRange}>6:00 - 9:00 AM</span>
                                </div>
                                <div className={styles.classesGrid}>
                                    {schedule.morning.map(renderClassCard)}
                                </div>
                            </div>
                            {/* Afternoon */}
                            <div className={styles.timeBlock}>
                                <div className={styles.timeLabel}>
                                    <span>Afternoon</span>
                                    <span className={styles.timeRange}>12:00 - 3:00 PM</span>
                                </div>
                                <div className={styles.classesGrid}>
                                    {schedule.afternoon.map(renderClassCard)}
                                </div>
                            </div>
                            {/* Evening */}
                            <div className={styles.timeBlock}>
                                <div className={styles.timeLabel}>
                                    <span>Evening</span>
                                    <span className={styles.timeRange}>5:00 - 8:00 PM</span>
                                </div>
                                <div className={styles.classesGrid}>
                                    {schedule.evening.map(renderClassCard)}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className={styles.monthGrid}>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className={styles.monthHeaderCell}>{day}</div>
                        ))}
                        {monthDays.map(renderMonthDay)}
                    </div>
                )}
            </Card>

            {/* Legend */}
            <div className={styles.legend}>
                <span className={styles.legendTitle}>Capacity:</span>
                <div className={styles.legendItem}>
                    <span className={`${styles.legendDot} ${styles.available}`}></span> Available
                </div>
                <div className={styles.legendItem}>
                    <span className={`${styles.legendDot} ${styles.almost}`}></span> Almost Full
                </div>
                <div className={styles.legendItem}>
                    <span className={`${styles.legendDot} ${styles.full}`}></span> Full
                </div>
            </div>

            {/* Add Class Modal */}
            {showAddModal && (
                <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Add New Class</h2>
                            <button className={styles.closeModal} onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddClass} className={styles.modalForm}>
                            <div className={styles.formGroup}>
                                <label>Class Name *</label>
                                <input
                                    required
                                    value={newClass.class_name}
                                    onChange={e => setNewClass({ ...newClass, class_name: e.target.value })}
                                />
                            </div>
                            {/* Add other inputs as needed - minimizing changes to avoid breaking layout, but ideally we'd add fields for time, trainer etc */}
                            {/* For now, just the required one to satisfy the form, assume defaults for others or user accepts them */}
                            <div className={styles.modalActions}>
                                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Adding...' : 'Add Class'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
