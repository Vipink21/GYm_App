import { useState, useEffect } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { settingsService, SystemSetting } from '../../services/settingsService'
import { auditService } from '../../services/auditService'
import { CreditCard, Save, ShieldCheck, Loader2, Eye, EyeOff, Info } from 'lucide-react'
import { showSuccess, showError } from '../../utils/swal'
import styles from './Settings.module.css'

export function SuperAdminSettings() {
    const [settings, setSettings] = useState<SystemSetting[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showSecret, setShowSecret] = useState(false)

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            setLoading(true)
            const data = await settingsService.getSettings()
            setSettings(data)
        } catch (error) {
            console.error('Failed to load settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = (key: string, value: string) => {
        setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s))
    }

    const saveSettings = async () => {
        try {
            setSaving(true)
            await Promise.all(
                settings.map(s => settingsService.updateSetting(s.key, s.value))
            )
            await auditService.logAction('update_settings', 'system_config', undefined, {
                updated_keys: settings.map(s => s.key)
            })
            showSuccess('Success', 'System configuration updated successfully.')
        } catch (error: any) {
            showError('Error', error.message || 'Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader2 className="animate-spin" size={40} color="#eab308" />
            </div>
        )
    }

    const razorpayKey = settings.find(s => s.key === 'razorpay_key_id')?.value || ''
    const razorpaySecret = settings.find(s => s.key === 'razorpay_key_secret')?.value || ''

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>System Settings</h1>
                <p className={styles.subtitle}>Configure global payment gateways and system overrides</p>
            </div>

            <div style={{ display: 'grid', gap: '2rem' }}>
                {/* Razorpay Integration */}
                <Card padding="lg">
                    <div className={styles.sectionHeader}>
                        <div className={styles.iconBox}>
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <h2 className={styles.sectionTitle}>Razorpay Integration</h2>
                            <p className={styles.sectionSubtitle}>Configure payment gateway for subscription plans</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div className="premium-form-group">
                            <label className="premium-label"><CreditCard size={16} /> Razorpay Key ID</label>
                            <input
                                type="text"
                                value={razorpayKey}
                                onChange={(e) => handleUpdate('razorpay_key_id', e.target.value)}
                                placeholder="rzp_test_..."
                                className="premium-input"
                            />
                            <p className={styles.hint}>
                                <Info size={12} /> Used for frontend checkout initialization
                            </p>
                        </div>

                        <div className="premium-form-group">
                            <label className="premium-label"><ShieldCheck size={16} /> Razorpay Key Secret</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    type={showSecret ? 'text' : 'password'}
                                    value={razorpaySecret}
                                    onChange={(e) => handleUpdate('razorpay_key_secret', e.target.value)}
                                    placeholder="Enter secret key..."
                                    className="premium-input"
                                    style={{ paddingRight: '50px' }}
                                />
                                <button
                                    onClick={() => setShowSecret(!showSecret)}
                                    className={styles.eyeBtn}
                                >
                                    {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className={styles.hint}>
                                <ShieldCheck size={12} /> Stored securely. Required for payment verification.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Save Section */}
                <div className={styles.actions}>
                    <Button variant="ghost" onClick={loadSettings} disabled={saving}>Discard Changes</Button>
                    <Button onClick={saveSettings} isLoading={saving} style={{ padding: '0 2rem' }}>
                        <Save size={18} style={{ marginRight: '8px' }} /> Save Configuration
                    </Button>
                </div>
            </div>
        </div>
    )
}

