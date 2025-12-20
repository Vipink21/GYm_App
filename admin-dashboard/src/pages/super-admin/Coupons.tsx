import { useState, useEffect } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { couponService, Coupon } from '../../services/couponService'
import { auditService } from '../../services/auditService'
import { Tag, Plus, Trash2, Power, Calendar, Users, Percent, CreditCard } from 'lucide-react'
import { showSuccess, showError, showConfirm } from '../../utils/swal'
import styles from './Coupons.module.css'

export function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'percentage' as const,
        discount_value: 0,
        max_uses: undefined as number | undefined,
        expiry_date: ''
    })

    useEffect(() => {
        loadCoupons()
    }, [])

    const loadCoupons = async () => {
        try {
            setLoading(true)
            const data = await couponService.getCoupons()
            setCoupons(data)
        } catch (error) {
            console.error('Failed to load coupons:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const coupon = await couponService.createCoupon(formData)
            await auditService.logAction('create', 'coupon', coupon.id, { code: formData.code })
            showSuccess('Created', 'Coupon code generated successfully.')
            setShowModal(false)
            loadCoupons()
        } catch (error: any) {
            showError('Error', error.message)
        }
    }

    const handleToggle = async (id: string, active: boolean, code: string) => {
        try {
            await couponService.toggleCoupon(id, !active)
            await auditService.logAction(!active ? 'activate' : 'deactivate', 'coupon', id, { code })
            loadCoupons()
        } catch (error: any) {
            showError('Error', error.message)
        }
    }

    const handleDelete = async (id: string, code: string) => {
        const result = await showConfirm('Delete Coupon', `Are you sure you want to delete "${code}"?`)
        if (result.isConfirmed) {
            try {
                await couponService.deleteCoupon(id)
                await auditService.logAction('delete', 'coupon', id, { code })
                showSuccess('Deleted', 'Coupon removed.')
                loadCoupons()
            } catch (error: any) {
                showError('Error', error.message)
            }
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Coupons & Discounts</h1>
                    <p className={styles.subtitle}>Promotional codes for SaaS subscription plans</p>
                </div>
                <Button onClick={() => setShowModal(true)}>
                    <Plus size={20} /> Create New Coupon
                </Button>
            </div>

            <div className={styles.grid}>
                {loading ? (
                    <div className={styles.empty}>Loading coupons...</div>
                ) : coupons.length > 0 ? (
                    coupons.map(coupon => (
                        <Card key={coupon.id} padding="lg" className={`${styles.couponCard} ${!coupon.is_active ? styles.inactive : ''}`}>
                            <div className={styles.cardHeader}>
                                <div className={styles.codeBox}>
                                    <Tag size={16} /> {coupon.code}
                                </div>
                                <div className={styles.cardActions}>
                                    <button
                                        onClick={() => handleToggle(coupon.id, coupon.is_active, coupon.code)}
                                        className={`${styles.actionBtn} ${coupon.is_active ? styles.active : ''}`}
                                        title={coupon.is_active ? 'Deactivate' : 'Activate'}
                                    >
                                        <Power size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(coupon.id, coupon.code)}
                                        className={styles.deleteBtn}
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className={styles.discountValue}>
                                {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                                <span className={styles.discountLabel}>OFF</span>
                            </div>

                            <div className={styles.statsRow}>
                                <div className={styles.statItem}>
                                    <Users size={14} />
                                    <span>{coupon.current_uses} / {coupon.max_uses || '∞'} used</span>
                                </div>
                                <div className={styles.statItem}>
                                    <Calendar size={14} />
                                    <span>{coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : 'Never expires'}</span>
                                </div>
                            </div>

                            {!coupon.is_active && <div className={styles.disabledBadge}>PAUSED</div>}
                        </Card>
                    ))
                ) : (
                    <div className={styles.empty}>No coupons created yet.</div>
                )}
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Create Promotional Coupon"
            >
                <form onSubmit={handleCreate} className={styles.modalForm}>
                    <div className="premium-form-group">
                        <label className="premium-label">Coupon Code (Uppercase)</label>
                        <input
                            type="text"
                            required
                            className="premium-input"
                            value={formData.code}
                            onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            placeholder="e.g., WELCOME50"
                        />
                    </div>

                    <div className="premium-form-row">
                        <div className="premium-form-group">
                            <label className="premium-label">Discount Type</label>
                            <select
                                className="premium-input"
                                value={formData.discount_type}
                                onChange={e => setFormData({ ...formData, discount_type: e.target.value as any })}
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (₹)</option>
                            </select>
                        </div>
                        <div className="premium-form-group">
                            <label className="premium-label">Value</label>
                            <input
                                type="number"
                                required
                                className="premium-input"
                                value={formData.discount_value}
                                onChange={e => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="premium-form-row">
                        <div className="premium-form-group">
                            <label className="premium-label">Max Uses (Optional)</label>
                            <input
                                type="number"
                                className="premium-input"
                                value={formData.max_uses || ''}
                                onChange={e => setFormData({ ...formData, max_uses: e.target.value ? Number(e.target.value) : undefined })}
                                placeholder="∞"
                            />
                        </div>
                        <div className="premium-form-group">
                            <label className="premium-label">Expiry Date (Optional)</label>
                            <input
                                type="date"
                                className="premium-input"
                                value={formData.expiry_date}
                                onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className={styles.modalActions}>
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit">Generate Coupon</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
