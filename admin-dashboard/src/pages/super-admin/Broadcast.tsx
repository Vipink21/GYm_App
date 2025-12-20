import { useState, useEffect } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { notificationService, AppNotification } from '../../services/notificationService'
import { auditService } from '../../services/auditService'
import { Megaphone, Send, Clock, Trash2, Filter } from 'lucide-react'
import { showSuccess, showError } from '../../utils/swal'
import styles from './Broadcast.module.css'

export function BroadcastPage() {
    const [notifications, setNotifications] = useState<AppNotification[]>([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info',
        target_role: 'all'
    })

    useEffect(() => {
        loadHistory()
    }, [])

    const loadHistory = async () => {
        try {
            setLoading(true)
            const data = await notificationService.getNotifications(true)
            setNotifications(data)
        } catch (error) {
            console.error('Failed to load logs:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setSending(true)
            await notificationService.sendBroadcast(formData)
            await auditService.logAction('broadcast', 'notification', undefined, { title: formData.title, target: formData.target_role })
            showSuccess('Sent!', 'Your broadcast has been sent successfully.')
            setFormData({ title: '', message: '', type: 'info', target_role: 'all' })
            loadHistory()
        } catch (error: any) {
            showError('Error', error.message)
        } finally {
            setSending(false)
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Broadcast Center</h1>
                <p className={styles.subtitle}>Send platform-wide announcements and alerts</p>
            </div>

            <div className={styles.content}>
                {/* Compose Section */}
                <Card padding="lg" className={styles.composeCard}>
                    <div className={styles.sectionHeader}>
                        <Megaphone size={24} className={styles.sectionIcon} />
                        <div>
                            <h2 className={styles.sectionTitle}>New Broadcast</h2>
                            <p className={styles.sectionSubtitle}>Compose a message for platform users</p>
                        </div>
                    </div>

                    <form onSubmit={handleSend} className={styles.form}>
                        <div className="premium-form-row">
                            <div className="premium-form-group">
                                <label className="premium-label">Target Audience</label>
                                <select
                                    className="premium-input"
                                    value={formData.target_role}
                                    onChange={e => setFormData({ ...formData, target_role: e.target.value })}
                                >
                                    <option value="all">Everyone</option>
                                    <option value="gym_owner">Gym Owners Only</option>
                                    <option value="trainer">Trainers Only</option>
                                    <option value="member">Members Only</option>
                                </select>
                            </div>
                            <div className="premium-form-group">
                                <label className="premium-label">Alert Type</label>
                                <select
                                    className="premium-input"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="info">Information (Blue)</option>
                                    <option value="success">Success (Green)</option>
                                    <option value="warning">Warning (Yellow)</option>
                                    <option value="error">Critical Alert (Red)</option>
                                </select>
                            </div>
                        </div>

                        <div className="premium-form-group">
                            <label className="premium-label">Message Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Scheduled Maintenance"
                                className="premium-input"
                            />
                        </div>

                        <div className="premium-form-group">
                            <label className="premium-label">Your Message</label>
                            <textarea
                                required
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Details of your announcement..."
                                className="premium-input"
                                style={{ height: '120px', resize: 'none' }}
                            />
                        </div>

                        <div className={styles.formActions}>
                            <Button type="submit" isLoading={sending} className={styles.sendBtn}>
                                <Send size={18} /> Send Broadcast
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* History Section */}
                <Card padding="lg" className={styles.historyCard}>
                    <div className={styles.sectionHeader}>
                        <Clock size={24} className={styles.sectionIcon} />
                        <h2 className={styles.sectionTitle}>Sent History</h2>
                    </div>

                    <div className={styles.logsList}>
                        {loading ? (
                            <div className={styles.empty}>Loading history...</div>
                        ) : notifications.length > 0 ? (
                            notifications.map(note => (
                                <div key={note.id} className={styles.logItem}>
                                    <div className={styles.logMeta}>
                                        <span className={`${styles.typeBadge} ${styles[note.type]}`}>
                                            {note.type}
                                        </span>
                                        <span className={styles.logDate}>
                                            {new Date(note.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <h3 className={styles.logTitle}>{note.title}</h3>
                                    <p className={styles.logBody}>{note.message}</p>
                                </div>
                            ))
                        ) : (
                            <div className={styles.empty}>No broadcast history found.</div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}
