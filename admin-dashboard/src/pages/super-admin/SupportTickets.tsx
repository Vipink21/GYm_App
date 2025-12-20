import { useState, useEffect } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { supportService, SupportTicket } from '../../services/supportService'
import { auditService } from '../../services/auditService'
import { Building2, User } from 'lucide-react'
import { showSuccess, showError } from '../../utils/swal'
import styles from './SupportTickets.module.css'

export function SupportTicketsPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all')
    const [showReplyModal, setShowReplyModal] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
    const [replyMessage, setReplyMessage] = useState('')
    const [sending, setSending] = useState(false)

    useEffect(() => {
        loadTickets()
    }, [])

    const loadTickets = async () => {
        try {
            setLoading(true)
            const data = await supportService.getTickets()
            setTickets(data)
        } catch (error) {
            console.error('Failed to load tickets:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (id: string, status: SupportTicket['status']) => {
        try {
            await supportService.updateTicketStatus(id, status)
            await auditService.logAction('update_status', 'support_ticket', id, { status })
            showSuccess('Updated', `Ticket status changed to ${status.replace('_', ' ')}`)
            loadTickets()
        } catch (error: any) {
            showError('Error', error.message)
        }
    }

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedTicket || !replyMessage.trim()) return

        try {
            setSending(true)
            await supportService.replyToTicket(selectedTicket.id, replyMessage)
            await auditService.logAction('ticket_reply', 'support_ticket', selectedTicket.id, {
                message_snippet: replyMessage.substring(0, 50),
                gym: selectedTicket.gym?.name
            })
            showSuccess('Reply Sent', 'Your response has been sent to the partner.')
            setShowReplyModal(false)
            setReplyMessage('')
            loadTickets()
        } catch (error: any) {
            showError('Error', error.message)
        } finally {
            setSending(false)
        }
    }

    const filteredTickets = tickets.filter(t =>
        filterStatus === 'all' || t.status === filterStatus
    )

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Partner Support</h1>
                <p className={styles.subtitle}>Manage help requests from gym owners and trainers</p>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${filterStatus === 'all' ? styles.active : ''}`}
                        onClick={() => setFilterStatus('all')}
                    >
                        All Tickets ({tickets.length})
                    </button>
                    <button
                        className={`${styles.tab} ${filterStatus === 'open' ? styles.active : ''}`}
                        onClick={() => setFilterStatus('open')}
                    >
                        Open ({tickets.filter(t => t.status === 'open').length})
                    </button>
                    <button
                        className={`${styles.tab} ${filterStatus === 'in_progress' ? styles.active : ''}`}
                        onClick={() => setFilterStatus('in_progress')}
                    >
                        In Progress ({tickets.filter(t => t.status === 'in_progress').length})
                    </button>
                    <button
                        className={`${styles.tab} ${filterStatus === 'resolved' ? styles.active : ''}`}
                        onClick={() => setFilterStatus('resolved')}
                    >
                        Resolved ({tickets.filter(t => t.status === 'resolved').length})
                    </button>
                </div>
            </div>

            <div className={styles.ticketGrid}>
                {loading ? (
                    <div className={styles.empty}>Loading tickets...</div>
                ) : filteredTickets.length > 0 ? (
                    filteredTickets.map(ticket => (
                        <Card key={ticket.id} padding="lg" className={styles.ticketCard}>
                            <div className={styles.ticketHeader}>
                                <div className={`${styles.priorityBadge} ${styles[ticket.priority]}`}>
                                    {ticket.priority}
                                </div>
                                <span className={styles.date}>{new Date(ticket.created_at).toLocaleDateString()}</span>
                            </div>

                            <h3 className={styles.ticketSubject}>{ticket.subject}</h3>
                            <p className={styles.ticketDesc}>{ticket.description}</p>

                            <div className={styles.ticketInfo}>
                                <div className={styles.infoRow}>
                                    <Building2 size={16} /> <span>{ticket.gym?.name}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <User size={16} /> <span>{ticket.user?.display_name} ({ticket.category})</span>
                                </div>
                            </div>

                            <div className={styles.ticketActions}>
                                <select
                                    className={styles.statusSelect}
                                    value={ticket.status}
                                    onChange={(e) => handleStatusChange(ticket.id, e.target.value as any)}
                                >
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedTicket(ticket)
                                        setShowReplyModal(true)
                                    }}
                                >
                                    Reply
                                </Button>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className={styles.empty}>No help requests found in this category.</div>
                )}
            </div>

            <Modal
                isOpen={showReplyModal}
                onClose={() => setShowReplyModal(false)}
                title={`Reply to Ticket #${selectedTicket?.id.slice(0, 8)}`}
            >
                <form onSubmit={handleReply} className={styles.modalForm}>
                    <div className={styles.ticketContext}>
                        <strong>Subject:</strong> {selectedTicket?.subject}
                    </div>
                    <div className="premium-form-group">
                        <label className="premium-label">Admin Response</label>
                        <textarea
                            required
                            value={replyMessage}
                            onChange={e => setReplyMessage(e.target.value)}
                            className="premium-input"
                            style={{ height: '150px', resize: 'none' }}
                            placeholder="Type your response here..."
                        />
                    </div>
                    <div className={styles.modalActions}>
                        <Button type="button" variant="ghost" onClick={() => setShowReplyModal(false)}>Cancel</Button>
                        <Button type="submit" isLoading={sending}>Send Response</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
