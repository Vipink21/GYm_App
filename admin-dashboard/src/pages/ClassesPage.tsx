import { Plus, Calendar, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import styles from './ClassesPage.module.css'

export function ClassesPage() {
    // Current week days
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const dates = ['9', '10', '11', '12', '13', '14', '15']
    const currentDay = 2 // Wednesday (index 2)

    // Sample classes data - grouped by day and time
    const schedule = {
        morning: [
            { id: '1', name: 'Morning Yoga', time: '6:00 AM', duration: 60, trainer: 'Priya S.', room: 'Studio A', capacity: 20, booked: 18, day: 0, color: 'purple' },
            { id: '2', name: 'HIIT Blast', time: '7:00 AM', duration: 45, trainer: 'Sarah M.', room: 'Main Floor', capacity: 25, booked: 22, day: 1, color: 'red' },
            { id: '3', name: 'Spin Class', time: '6:30 AM', duration: 45, trainer: 'Mike T.', room: 'Spin Room', capacity: 30, booked: 28, day: 2, color: 'blue' },
            { id: '4', name: 'Power Yoga', time: '7:00 AM', duration: 60, trainer: 'Priya S.', room: 'Studio A', capacity: 20, booked: 15, day: 3, color: 'purple' },
            { id: '5', name: 'CrossFit', time: '6:00 AM', duration: 60, trainer: 'John D.', room: 'CrossFit Zone', capacity: 15, booked: 15, day: 4, color: 'orange' },
        ],
        afternoon: [
            { id: '6', name: 'Zumba', time: '12:00 PM', duration: 45, trainer: 'Ananya R.', room: 'Studio B', capacity: 30, booked: 25, day: 0, color: 'pink' },
            { id: '7', name: 'Pilates', time: '1:00 PM', duration: 60, trainer: 'Priya S.', room: 'Studio A', capacity: 15, booked: 12, day: 2, color: 'teal' },
            { id: '8', name: 'Boxing', time: '12:30 PM', duration: 45, trainer: 'John D.', room: 'Boxing Ring', capacity: 12, booked: 10, day: 3, color: 'red' },
            { id: '9', name: 'Dance Fitness', time: '1:00 PM', duration: 60, trainer: 'Ananya R.', room: 'Studio B', capacity: 25, booked: 20, day: 5, color: 'pink' },
        ],
        evening: [
            { id: '10', name: 'Strength Training', time: '6:00 PM', duration: 60, trainer: 'Mike T.', room: 'Weight Room', capacity: 20, booked: 18, day: 0, color: 'blue' },
            { id: '11', name: 'HIIT Express', time: '7:00 PM', duration: 30, trainer: 'Sarah M.', room: 'Main Floor', capacity: 25, booked: 25, day: 1, color: 'red' },
            { id: '12', name: 'Yoga Flow', time: '6:30 PM', duration: 75, trainer: 'Priya S.', room: 'Studio A', capacity: 20, booked: 16, day: 2, color: 'purple' },
            { id: '13', name: 'Cardio Kickboxing', time: '7:00 PM', duration: 45, trainer: 'John D.', room: 'Main Floor', capacity: 20, booked: 19, day: 4, color: 'orange' },
            { id: '14', name: 'Weekend Warriors', time: '5:00 PM', duration: 90, trainer: 'Mike T.', room: 'CrossFit Zone', capacity: 15, booked: 14, day: 5, color: 'blue' },
            { id: '15', name: 'Sunday Stretch', time: '6:00 PM', duration: 60, trainer: 'Priya S.', room: 'Studio A', capacity: 25, booked: 10, day: 6, color: 'purple' },
        ],
    }

    const getCapacityStatus = (booked: number, capacity: number) => {
        if (booked >= capacity) return 'full'
        if (booked >= capacity * 0.8) return 'almost'
        return 'available'
    }

    const renderClassCard = (cls: any) => {
        const status = getCapacityStatus(cls.booked, cls.capacity)
        return (
            <div
                key={cls.id}
                className={`${styles.classCard} ${styles[cls.color]}`}
                style={{ gridColumn: cls.day + 1 }}
            >
                <div className={styles.classHeader}>
                    <span className={styles.className}>{cls.name}</span>
                    <span className={`${styles.capacityBadge} ${styles[status]}`}>
                        {cls.booked}/{cls.capacity}
                    </span>
                </div>
                <div className={styles.classDetails}>
                    <span className={styles.classTime}>
                        <Clock size={12} /> {cls.time} • {cls.duration}min
                    </span>
                    <span className={styles.classTrainer}>{cls.trainer}</span>
                    <span className={styles.classRoom}>{cls.room}</span>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.weekNav}>
                    <Button variant="ghost" size="sm"><ChevronLeft size={18} /></Button>
                    <span className={styles.weekLabel}>
                        <Calendar size={18} /> December 9 - 15, 2024
                    </span>
                    <Button variant="ghost" size="sm"><ChevronRight size={18} /></Button>
                </div>
                <div className={styles.headerActions}>
                    <Button variant="secondary" size="sm">
                        <Calendar size={16} /> Month View
                    </Button>
                    <Button size="sm">
                        <Plus size={16} /> Add Class
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className={styles.statsRow}>
                <div className={styles.stat}>
                    <span className={styles.statValue}>42</span>
                    <span className={styles.statLabel}>Classes This Week</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>512</span>
                    <span className={styles.statLabel}>Total Bookings</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>87%</span>
                    <span className={styles.statLabel}>Avg Capacity</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>8</span>
                    <span className={styles.statLabel}>Fully Booked</span>
                </div>
            </div>

            {/* Schedule Grid */}
            <Card padding="md">
                {/* Days Header */}
                <div className={styles.daysHeader}>
                    <div className={styles.timeColumn}></div>
                    {weekDays.map((day, i) => (
                        <div
                            key={day}
                            className={`${styles.dayColumn} ${i === currentDay ? styles.today : ''}`}
                        >
                            <span className={styles.dayName}>{day}</span>
                            <span className={styles.dayDate}>{dates[i]}</span>
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
        </div>
    )
}
