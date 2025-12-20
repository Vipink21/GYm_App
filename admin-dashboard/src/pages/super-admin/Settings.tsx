import { useState, useEffect } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { settingsService, SystemSetting } from '../../services/settingsService'
import { CreditCard, Save, ShieldCheck, Loader2, Eye, EyeOff, Info } from 'lucide-react'
import { showSuccess, showError } from '../../utils/swal'

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
            showSuccess('Success', 'Payment configuration updated updated successfully.')
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
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Platform Settings</h1>
                <p style={{ color: '#64748b' }}>Configure global payment gateways and system overrides</p>
            </div>

            <div style={{ display: 'grid', gap: '2rem' }}>
                {/* Razorpay Integration */}
                <Card padding="lg">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                        <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '12px', color: '#1d4ed8' }}>
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>Razorpay Integration</h2>
                            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Configure payment gateway for subscription plans</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gap: '8px' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Razorpay Key ID</label>
                            <input
                                type="text"
                                value={razorpayKey}
                                onChange={(e) => handleUpdate('razorpay_key_id', e.target.value)}
                                placeholder="rzp_test_..."
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                            />
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Info size={12} /> Used for frontend checkout initialization
                            </p>
                        </div>

                        <div style={{ display: 'grid', gap: '8px' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Razorpay Key Secret</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showSecret ? 'text' : 'password'}
                                    value={razorpaySecret}
                                    onChange={(e) => handleUpdate('razorpay_key_secret', e.target.value)}
                                    placeholder="Enter secret key..."
                                    style={{
                                        width: '100%',
                                        padding: '12px 45px 12px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '0.95rem',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    onClick={() => setShowSecret(!showSecret)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#64748b'
                                    }}
                                >
                                    {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <ShieldCheck size={12} /> Stored securely. Required for payment verification.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Save Section */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <Button variant="ghost" onClick={loadSettings} disabled={saving}>Discard Changes</Button>
                    <Button onClick={saveSettings} isLoading={saving} style={{ padding: '0 2rem' }}>
                        <Save size={18} style={{ marginRight: '8px' }} /> Save Configuration
                    </Button>
                </div>
            </div>
        </div>
    )
}
