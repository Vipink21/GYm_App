import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import styles from './ManualCheckInModal.module.css'

interface ManualCheckInModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: any) => void
}

export function ManualCheckInModal({ isOpen, onClose, onSubmit }: ManualCheckInModalProps) {
    const [formData, setFormData] = useState({
        memberId: '',
        trainerId: '',
        notes: ''
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manual Check-In">
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="memberId">Member Name / ID</label>
                    <input
                        id="memberId"
                        type="text"
                        placeholder="Enter member name or ID"
                        value={formData.memberId}
                        onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="trainerId">Assigned Trainer (Optional)</label>
                    <select
                        id="trainerId"
                        value={formData.trainerId}
                        onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                    >
                        <option value="">Select Trainer</option>
                        <option value="trainer1">Sarah M.</option>
                        <option value="trainer2">Mike T.</option>
                        <option value="trainer3">John D.</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="notes">Notes</label>
                    <input
                        id="notes"
                        type="text"
                        placeholder="Optional notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                </div>

                <div className={styles.formActions}>
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        Check In
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
