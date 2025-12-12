import { Plus, Search, Filter, Star } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import styles from './TrainersPage.module.css'

export function TrainersPage() {
    // Sample data - would come from Firebase in production
    const trainers = [
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
                    <span className={styles.statValue}>24</span>
                    <span className={styles.statLabel}>Total Trainers</span>
                </div>
                <div className={styles.statPill}>
                    <span className={styles.statValue}>21</span>
                    <span className={styles.statLabel}>Active</span>
                </div>
                <div className={styles.statPill}>
                    <span className={styles.statValue}>3</span>
                    <span className={styles.statLabel}>On Leave</span>
                </div>
                <div className={styles.statPill}>
                    <span className={styles.statValue}>4.8</span>
                    <span className={styles.statLabel}>Avg Rating</span>
                </div>
            </div>

            {/* Header Actions */}
            <div className={styles.actions}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input type="text" placeholder="Search trainers..." className={styles.searchInput} />
                </div>
                <div className={styles.actionButtons}>
                    <Button variant="ghost" size="sm">
                        <Filter size={16} /> Filter
                    </Button>
                    <Button size="sm">
                        <Plus size={16} /> Add Trainer
                    </Button>
                </div>
            </div>

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
                        {trainers.map((trainer) => (
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
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    )
}
