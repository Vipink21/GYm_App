import { ReactNode } from 'react'
import { clsx } from 'clsx'
import styles from './Card.module.css'

interface CardProps {
    children: ReactNode
    className?: string
    padding?: 'sm' | 'md' | 'lg' | 'none'
}

export function Card({ children, className, padding = 'md' }: CardProps) {
    return (
        <div className={clsx(styles.card, styles[padding], className)}>
            {children}
        </div>
    )
}

interface CardHeaderProps {
    title: string
    action?: ReactNode
}

export function CardHeader({ title, action }: CardHeaderProps) {
    return (
        <div className={styles.header}>
            <h3 className={styles.title}>{title}</h3>
            {action && <div className={styles.action}>{action}</div>}
        </div>
    )
}
