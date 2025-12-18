import { Crown } from 'lucide-react'
import styles from './SubscriptionBadge.module.css'

interface Props {
    planName: string
    status: string
    trialDaysLeft?: number
}

export function SubscriptionBadge({ planName, status, trialDaysLeft }: Props) {
    const isPro = planName === 'Pro' || planName === 'Enterprise'

    return (
        <div className={`${styles.badge} ${isPro ? styles.pro : styles.free}`}>
            {isPro && <Crown size={14} />}
            <span>{planName}</span>
            {status === 'trialing' && trialDaysLeft !== undefined && (
                <span className={styles.trial}>{trialDaysLeft} days left</span>
            )}
        </div>
    )
}
