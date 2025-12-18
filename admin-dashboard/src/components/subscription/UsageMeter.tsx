import styles from './UsageMeter.module.css'

interface Props {
    used: number
    limit: number | null
    label: string
}

export function UsageMeter({ used, limit, label }: Props) {
    const percentage = limit ? (used / limit) * 100 : 0
    const isNearLimit = percentage > 80
    const isUnlimited = limit === null || limit > 900000

    return (
        <div className={styles.meter}>
            <div className={styles.header}>
                <span>{label}</span>
                <span className={isNearLimit ? styles.warning : ''}>
                    {used} / {isUnlimited ? '∞' : limit}
                </span>
            </div>
            {!isUnlimited && (
                <div className={styles.bar}>
                    <div
                        className={`${styles.fill} ${isNearLimit ? styles.fillWarning : ''}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>
            )}
            {isNearLimit && !isUnlimited && (
                <p style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.5rem' }}>
                    ⚠️ You're approaching your limit. Consider upgrading your plan.
                </p>
            )}
        </div>
    )
}
