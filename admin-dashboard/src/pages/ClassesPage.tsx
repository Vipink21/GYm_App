import { useState } from 'react'
import { Plus, Calendar, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import styles from './ClassesPage.module.css'

interface GymClass {
    id: string
    name: string
    time: string
    duration: number
    trainer: string
    room: string
    capacity: number
    booked: number
    day: number
    color: string
}

const initialSchedule = {
    morning: [
        { id: '1', name: 'Morning Yoga', time: '6:00 AM', duration: 60, trainer: 'Priya S.', room: 'Studio A', capacity: 20, booked: 18, day: 0, color: 'purple' },
        { id: '2', name: 'HIIT Blast', time: '7:00 AM', duration: 45, trainer: 'Sarah M.', room: 'Main Floor', capacity: 25, booked: 22, day: 1, color: 'red' },
        { id: '3', name: 'Spin Class', time: '6:30 AM', duration: 45, trainer: 'Mike T.', room: 'Spin Room', capacity: 30, booked: 28, day: 2, color: 'blue' },
        { id: '4', name: 'Power Yoga', time: '7:00 AM', duration: 60, trainer: 'Priya S.', room: 'Studio A', capacity: 20, booked: 15, day: 3, color: 'purple' },
        { id: '5', name: 'CrossFit', time: '6:00 AM', duration: 60, trainer: 'John D.', room: 'CrossFit Zone', capacity: 15, booked: 15, day: 4, color: 'orange' },
    ] as GymClass[],
    afternoon: [
        { id: '6', name: 'Zumba', time: '12:00 PM', duration: 45, trainer: 'Ananya R.', room: 'Studio B', capacity: 30, booked: 25, day: 0, color: 'pink' },
        { id: '7', name: 'Pilates', time: '1:00 PM', duration: 60, trainer: 'Priya S.', room: 'Studio A', capacity: 15, booked: 12, day: 2, color: 'teal' },
        { id: '8', name: 'Boxing', time: '12:30 PM', duration: 45, trainer: 'John D.', room: 'Boxing Ring', capacity: 12, booked: 10, day: 3, color: 'red' },
        { id: '9', name: 'Dance Fitness', time: '1:00 PM', duration: 60, trainer: 'Ananya R.', room: 'Studio B', capacity: 25, booked: 20, day: 5, color: 'pink' },
    ] as GymClass[],
    evening: [
        { id: '10', name: 'Strength Training', time: '6:00 PM', duration: 60, trainer: 'Mike T.', room: 'Weight Room', capacity: 20, booked: 18, day: 0, color: 'blue' },
        { id: '11', name: 'HIIT Express', time: '7:00 PM', duration: 30, trainer: 'Sarah M.', room: 'Main Floor', capacity: 25, booked: 25, day: 1, color: 'red' },
        { id: '12', name: 'Yoga Flow', time: '6:30 PM', duration: 75, trainer: 'Priya S.', room: 'Studio A', capacity: 20, booked: 16, day: 2, color: 'purple' },
        { id: '13', name: 'Cardio Kickboxing', time: '7:00 PM', duration: 45, trainer: 'John D.', room: 'Main Floor', capacity: 20, booked: 19, day: 4, color: 'orange' },
        { id: '14', name: 'Weekend Warriors', time: '5:00 PM', duration: 90, trainer: 'Mike T.', room: 'CrossFit Zone', capacity: 15, booked: 14, day: 5, color: 'blue' },
        { id: '15', name: 'Sunday Stretch', time: '6:00 PM', duration: 60, trainer: 'Priya S.', room: 'Studio A', capacity: 25, booked: 10, day: 6, color: 'purple' },
    ] as GymClass[],
}

const trainers = ['Priya S.', 'Sarah M.', 'Mike T.', 'John D.', 'Ananya R.']
const rooms = ['Studio A', 'Studio B', 'Main Floor', 'Spin Room', 'Weight Room', 'CrossFit Zone', 'Boxing Ring']
const colors = ['purple', 'red', 'blue', 'orange', 'pink', 'teal']
const timeSlots = ['morning', 'afternoon', 'evening'] as const

export function ClassesPage() {
    const [schedule, setSchedule] = useState(initialSchedule)
    const [showAddModal, setShowAddModal] = useState(false)
    const [weekOffset, setWeekOffset] = useState(0)

    // New class form state
    const [newClass, setNewClass] = useState({
        name: '',
        time: '9:00 AM',
        duration: 60,
        trainer: 'Sarah M.',
        room: 'Studio A',
        capacity: 20,
        day: 0,
        color: 'blue',
        timeSlot: 'morning' as 'morning' | 'afternoon' | 'evening'
    })

    // Current week days
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const getWeekDates = () => {
        const today = new Date()
        today.setDate(today.getDate() + (weekOffset * 7))
        const monday = new Date(today)
        monday.setDate(today.getDate() - today.getDay() + 1)
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(monday)
            date.setDate(monday.getDate() + i)
            return date.getDate().toString()
        })
    }
    const dates = getWeekDates()
    const currentDay = weekOffset === 0 ? new Date().getDay() - 1 : -1 // -1 for Sunday fix

    // Compute stats
    const allClasses = [...schedule.morning, ...schedule.afternoon, ...schedule.evening]
    const totalBookings = allClasses.reduce((sum, c) => sum + c.booked, 0)
    const totalCapacity = allClasses.reduce((sum, c) => sum + c.capacity, 0)
    const avgCapacity = Math.round((totalBookings / totalCapacity) * 100)
    const fullyBooked = allClasses.filter(c => c.booked >= c.capacity).length

    const getCapacityStatus = (booked: number, capacity: number) => {
        if (booked >= capacity) return 'full'
        if (booked >= capacity * 0.8) return 'almost'
        return 'available'
    }

    const handleAddClass = (e: React.FormEvent) => {
        e.preventDefault()
        const gymClass: GymClass = {
            id: String(Date.now()),
            name: newClass.name,
            time: newClass.time,
            duration: newClass.duration,
            trainer: newClass.trainer,
            room: newClass.room,
            capacity: newClass.capacity,
            booked: 0,
            day: newClass.day,
            color: newClass.color
        }
        setSchedule(prev => ({
            ...prev,
            [newClass.timeSlot]: [...prev[newClass.timeSlot], gymClass]
        }))
        setNewClass({
            name: '',
            time: '9:00 AM',
            duration: 60,
            trainer: 'Sarah M.',
            room: 'Studio A',
            capacity: 20,
            day: 0,
            color: 'blue',
            timeSlot: 'morning'
        })
        setShowAddModal(false)
    }

    const getWeekLabel = () => {
        const today = new Date()
        today.setDate(today.getDate() + (weekOffset * 7))
        const monday = new Date(today)
        monday.setDate(today.getDate() - today.getDay() + 1)
        const sunday = new Date(monday)
        sunday.setDate(monday.getDate() + 6)
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        return `${monthNames[monday.getMonth()]} ${monday.getDate()} - ${sunday.getDate()}, ${monday.getFullYear()}`
    }

    const renderClassCard = (cls: GymClass) => {
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
                    <Button variant="ghost" size="sm" onClick={() => setWeekOffset(prev => prev - 1)}>
                        <ChevronLeft size={18} />
                    </Button>
                    <span className={styles.weekLabel}>
                        <Calendar size={18} /> {getWeekLabel()}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => setWeekOffset(prev => prev + 1)}>
                        <ChevronRight size={18} />
                    </Button>
                    {weekOffset !== 0 && (
                        <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>
                            Today
                        </Button>
                    )}
                </div>
                <div className={styles.headerActions}>
                    <Button variant="secondary" size="sm">
                        <Calendar size={16} /> Month View
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
                                <label htmlFor="className">Class Name *</label>
                                <input
                                    type="text"
                                    id="className"
                                    required
                                    value={newClass.name}
                                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                                    placeholder="e.g., Morning Yoga"
                                />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="time">Time</label>
                                    <input
                                        type="text"
                                        id="time"
                                        value={newClass.time}
                                        onChange={(e) => setNewClass({ ...newClass, time: e.target.value })}
                                        placeholder="e.g., 9:00 AM"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="duration">Duration (min)</label>
                                    <input
                                        type="number"
                                        id="duration"
                                        min={15}
                                        max={120}
                                        value={newClass.duration}
                                        onChange={(e) => setNewClass({ ...newClass, duration: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="trainer">Trainer</label>
                                    <select
                                        id="trainer"
                                        value={newClass.trainer}
                                        onChange={(e) => setNewClass({ ...newClass, trainer: e.target.value })}
                                    >
                                        {trainers.map(trainer => (
                                            <option key={trainer} value={trainer}>{trainer}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="room">Room</label>
                                    <select
                                        id="room"
                                        value={newClass.room}
                                        onChange={(e) => setNewClass({ ...newClass, room: e.target.value })}
                                    >
                                        {rooms.map(room => (
                                            <option key={room} value={room}>{room}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="day">Day</label>
                                    <select
                                        id="day"
                                        value={newClass.day}
                                        onChange={(e) => setNewClass({ ...newClass, day: Number(e.target.value) })}
                                    >
                                        {weekDays.map((day, i) => (
                                            <option key={day} value={i}>{day}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="timeSlot">Time Slot</label>
                                    <select
                                        id="timeSlot"
                                        value={newClass.timeSlot}
                                        onChange={(e) => setNewClass({ ...newClass, timeSlot: e.target.value as typeof newClass.timeSlot })}
                                    >
                                        {timeSlots.map(slot => (
                                            <option key={slot} value={slot}>{slot.charAt(0).toUpperCase() + slot.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="capacity">Capacity</label>
                                    <input
                                        type="number"
                                        id="capacity"
                                        min={5}
                                        max={50}
                                        value={newClass.capacity}
                                        onChange={(e) => setNewClass({ ...newClass, capacity: Number(e.target.value) })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Color</label>
                                    <div className={styles.colorPicker}>
                                        {colors.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                className={`${styles.colorOption} ${styles[color]} ${newClass.color === color ? styles.colorSelected : ''}`}
                                                onClick={() => setNewClass({ ...newClass, color })}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.modalActions}>
                                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Add Class
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
