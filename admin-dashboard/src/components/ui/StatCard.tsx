import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import styles from './StatCard.module.css'

interface StatCardProps {
    title: string
    value: string | number
    change?: {
        value: number
        type: 'increase' | 'decrease'
    }
    icon: LucideIcon
    color?: 'gold' | 'green' | 'blue' | 'purple'
}

export function StatCard({ title, value, change, icon: Icon, color = 'gold' }: StatCardProps) {
    return (
        <div className={styles.card}>
            <div className={styles.content}>
                <span className={styles.title}>{title}</span>
                <span className={styles.value}>{value}</span>
                {change && (
                    <div className={`${styles.change} ${styles[change.type]}`}>
                        {change.type === 'increase' ? (
                            <TrendingUp size={14} />
                        ) : (
                            <TrendingDown size={14} />
                        )}
                        <span>{Math.abs(change.value)}%</span>
                    </div>
                )}
            </div>
            <div className={`${styles.iconWrapper} ${styles[color]}`}>
                <Icon size={24} />
            </div>
        </div>
    )
}
