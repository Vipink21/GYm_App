import { useState, useEffect } from 'react'
import { auditService, AuditLog } from '../../services/auditService'
import { Card } from '../../components/ui/Card'
import { Shield, User, Activity, Clock, Search, ChevronRight } from 'lucide-react'
import styles from './AuditLogs.module.css'

export function AuditLogPage() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        loadLogs()
    }, [])

    const loadLogs = async () => {
        try {
            setLoading(true)
            const data = await auditService.getLogs()
            setLogs(data)
        } catch (error) {
            console.error('Failed to fetch logs:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.admin?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>System Audit Logs</h1>
                <p className={styles.subtitle}>Track all administrative actions across the platform</p>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <Search size={20} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by action, admin or entity..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            <Card padding="none">
                <div className={styles.list}>
                    {loading ? (
                        <div className={styles.empty}>Loading audit trail...</div>
                    ) : filteredLogs.length > 0 ? (
                        filteredLogs.map(log => (
                            <div key={log.id} className={styles.logRow}>
                                <div className={styles.logIcon}>
                                    <Activity size={20} />
                                </div>
                                <div className={styles.logContent}>
                                    <div className={styles.logMain}>
                                        <span className={styles.adminName}>{log.admin?.display_name || 'System'}</span>
                                        <span className={styles.actionText}>{log.action}</span>
                                        <span className={styles.entityTag}>{log.entity}</span>
                                        {log.entity_id && <span className={styles.entityId}>#{log.entity_id.slice(0, 8)}</span>}
                                    </div>
                                    <div className={styles.logDetails}>
                                        <div className={styles.detailItem}>
                                            <User size={14} /> {log.admin?.email || 'automated@fitzone.com'}
                                        </div>
                                        <div className={styles.detailItem}>
                                            <Clock size={14} /> {new Date(log.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.logData}>
                                    <button className={styles.viewDataBtn} onClick={() => console.log(log.details)}>
                                        Details <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.empty}>No audit logs found.</div>
                    )}
                </div>
            </Card>
        </div>
    )
}
