import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { memberService, MemberUI } from '../../services/memberService'
import { trainerService, TrainerUI } from '../../services/trainerService'
import { useAuth } from '../../contexts/AuthContext'
import styles from './ManualCheckInModal.module.css'

interface ManualCheckInModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: any) => void
}

export function ManualCheckInModal({ isOpen, onClose, onSubmit }: ManualCheckInModalProps) {
    const { user, userData } = useAuth()
    const [members, setMembers] = useState<MemberUI[]>([])
    const [trainers, setTrainers] = useState<TrainerUI[]>([])
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        memberId: '',
        memberName: '',
        trainerName: '',
        notes: ''
    })

    useEffect(() => {
        if (isOpen && (userData?.gymId || user?.id)) {
            const gymId = userData?.gymId || user!.id
            setLoading(true)
            Promise.all([
                memberService.getMembers(gymId),
                trainerService.getTrainers(gymId)
            ]).then(([membersData, trainersData]) => {
                setMembers(membersData)
                setTrainers(trainersData)
            }).finally(() => setLoading(false))
        }
    }, [isOpen, user, userData])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const selectedMember = members.find(m => m.id === formData.memberId)
        onSubmit({
            ...formData,
            member_name: selectedMember?.full_name || formData.memberName
        })
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manual Check-In">
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="memberId">Select Member</label>
                    <select
                        id="memberId"
                        value={formData.memberId}
                        onChange={(e) => {
                            const member = members.find(m => m.id === e.target.value)
                            setFormData({
                                ...formData,
                                memberId: e.target.value,
                                memberName: member?.full_name || ''
                            })
                        }}
                        disabled={loading}
                        required
                    >
                        <option value="">Choose a member...</option>
                        {members.map(m => (
                            <option key={m.id} value={m.id}>{m.full_name} ({m.phone})</option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="trainerName">Assigned Trainer (Optional)</label>
                    <select
                        id="trainerName"
                        value={formData.trainerName}
                        onChange={(e) => setFormData({ ...formData, trainerName: e.target.value })}
                        disabled={loading}
                    >
                        <option value="">Select Trainer</option>
                        {trainers.map(t => (
                            <option key={t.id} value={t.full_name}>{t.full_name}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="notes">Notes</label>
                    <input
                        id="notes"
                        type="text"
                        placeholder="Optional notes (e.g. workout type)"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                </div>

                <div className={styles.formActions}>
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading || !formData.memberId}>
                        {loading ? 'Loading...' : 'Check In'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}

