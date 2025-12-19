import { useState, useEffect, useRef } from 'react'
import { Save, Building, Bell, Shield, CreditCard, Clock, Users, Check } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import styles from './SettingsPage.module.css'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { showError, showSuccess } from '../utils/swal'

export function SettingsPage() {
    const { user } = useAuth()
    const [activeSection, setActiveSection] = useState('gym')
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Form State
    const [gymProfile, setGymProfile] = useState({
        name: 'FitZone Premium',
        branch_name: 'Downtown Branch',
        email: 'hello@fitzone.com',
        phone: '+91 98765 43210',
        address: '123 Fitness Street, MG Road, Bengaluru, Karnataka 560001',
    })

    // Refs for sections
    const sectionRefs = {
        gym: useRef<HTMLDivElement>(null),
        hours: useRef<HTMLDivElement>(null),
        membership: useRef<HTMLDivElement>(null),
        payments: useRef<HTMLDivElement>(null),
        notifications: useRef<HTMLDivElement>(null),
        security: useRef<HTMLDivElement>(null),
    }

    // Fetch Settings on Mount
    useEffect(() => {
        async function fetchSettings() {
            if (!user) return

            try {
                // If demo user, don't fetch real data or maybe fetch a demo row if it exists
                if (user.id === 'mock-admin-id') {
                    setIsLoading(false)
                    return
                }

                // Use gymId from user metadata (assuming AuthContext provides it or direct metadata)
                const gymId = user.user_metadata?.gym_id || user.id

                const { data, error } = await supabase
                    .from('gyms') // CHANGED from gym_settings to gyms
                    .select('*')
                    .eq('id', gymId)
                    .single()

                if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
                    console.error('Error fetching settings:', error)
                }

                if (data) {
                    setGymProfile({
                        name: data.name || '',
                        branch_name: '', // Removed from schema or not present
                        email: data.email || '',
                        phone: data.phone || '',
                        address: data.address || ''
                    })
                }
            } catch (err) {
                console.error('Unexpected error:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSettings()
    }, [user])

    const scrollToSection = (sectionId: string) => {
        setActiveSection(sectionId)
        const element = document.getElementById(sectionId)
        if (element) {
            const offset = 120
            const elementPosition = element.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.pageYOffset - offset
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            if (user?.id === 'mock-admin-id') {
                // Fake save for demo
                await new Promise(resolve => setTimeout(resolve, 1000))
            } else if (user) {
                // Let's use the correct Gym ID lookup
                const gymId = user.user_metadata?.gym_id || user.id // Fallback

                const { error: updateError } = await supabase
                    .from('gyms')
                    .update({
                        name: gymProfile.name,
                        address: gymProfile.address,
                        phone: gymProfile.phone,
                        email: gymProfile.email,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', gymId)

                if (updateError) throw updateError
            }

            await showSuccess('Settings Saved', 'Your changes have been saved successfully.')
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (err: any) {
            console.error('Error saving settings:', err)
            showError('Error', err.message || 'Failed to save settings')
        } finally {
            setIsSaving(false)
        }
    }

    const navItems = [
        { id: 'gym', icon: Building, label: 'Gym Profile' },
        { id: 'hours', icon: Clock, label: 'Operating Hours' },
        { id: 'membership', icon: Users, label: 'Membership Plans' },
        { id: 'payments', icon: CreditCard, label: 'Payment Settings' },
        { id: 'notifications', icon: Bell, label: 'Notifications' },
        { id: 'security', icon: Shield, label: 'Security' },
    ]

    return (
        <div className={styles.page}>
            <div className={styles.layout}>
                <aside className={styles.sidebar}>
                    <nav className={styles.nav}>
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className={`${styles.navItem} ${activeSection === item.id ? styles.active : ''}`}
                            >
                                <item.icon size={18} /> {item.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className={styles.content}>
                    {/* Gym Profile Section */}
                    <div ref={sectionRefs.gym} id="gym" className={styles.sectionWrapper}>
                        <Card className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <Building size={20} /> Gym Profile
                            </h2>
                            {isLoading ? <p>Loading settings...</p> : (
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label>Gym Name</label>
                                        <input
                                            type="text"
                                            value={gymProfile.name}
                                            onChange={(e) => setGymProfile({ ...gymProfile, name: e.target.value })}
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Branch Name</label>
                                        <input
                                            type="text"
                                            value={gymProfile.branch_name}
                                            onChange={(e) => setGymProfile({ ...gymProfile, branch_name: e.target.value })}
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            value={gymProfile.email}
                                            onChange={(e) => setGymProfile({ ...gymProfile, email: e.target.value })}
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Phone</label>
                                        <input
                                            type="tel"
                                            value={gymProfile.phone}
                                            onChange={(e) => setGymProfile({ ...gymProfile, phone: e.target.value })}
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroupFull}>
                                        <label>Address</label>
                                        <textarea
                                            className={styles.textarea}
                                            value={gymProfile.address}
                                            onChange={(e) => setGymProfile({ ...gymProfile, address: e.target.value })}
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Operating Hours (Static for now, can be dynamic later) */}
                    <div ref={sectionRefs.hours} id="hours" className={styles.sectionWrapper}>
                        <Card className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <Clock size={20} /> Operating Hours
                            </h2>
                            <div className={styles.hoursGrid}>
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                    <div key={day} className={styles.hourRow}>
                                        <span className={styles.dayLabel}>{day}</span>
                                        <div className={styles.timeInputs}>
                                            <input type="time" defaultValue={day === 'Sunday' ? '07:00' : '05:00'} className={styles.timeInput} />
                                            <span>to</span>
                                            <input type="time" defaultValue={day === 'Sunday' ? '18:00' : '23:00'} className={styles.timeInput} />
                                        </div>
                                        <label className={styles.toggle}>
                                            <input type="checkbox" defaultChecked={true} />
                                            <span className={styles.toggleSlider}></span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Other sections preserved as placeholders for brevity, functionality focuses on Gym Profile first */}
                    <div ref={sectionRefs.membership} id="membership" className={styles.sectionWrapper}>
                        <Card className={styles.section}>
                            <h2 className={styles.sectionTitle}><Users size={20} /> Membership Plans</h2>
                            <p style={{ padding: '1rem', color: '#888' }}>Coming soon with dynamic plans!</p>
                        </Card>
                    </div>

                    <div ref={sectionRefs.payments} id="payments" className={styles.sectionWrapper}>
                        <Card className={styles.section}>
                            <h2 className={styles.sectionTitle}><CreditCard size={20} /> Payment Settings</h2>
                            <p style={{ padding: '1rem', color: '#888' }}>Coming soon!</p>
                        </Card>
                    </div>

                    <div ref={sectionRefs.notifications} id="notifications" className={styles.sectionWrapper}>
                        <Card className={styles.section}>
                            <h2 className={styles.sectionTitle}><Bell size={20} /> Notification Settings</h2>
                            <p style={{ padding: '1rem', color: '#888' }}>Coming soon!</p>
                        </Card>
                    </div>

                    <div ref={sectionRefs.security} id="security" className={styles.sectionWrapper}>
                        <Card className={styles.section}>
                            <h2 className={styles.sectionTitle}><Shield size={20} /> Security</h2>
                            <p style={{ padding: '1rem', color: '#888' }}>Coming soon!</p>
                        </Card>
                    </div>

                    {/* Save Button */}
                    <div className={styles.actions}>
                        <Button variant="secondary" onClick={() => window.location.reload()}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? (
                                'Saving...'
                            ) : saved ? (
                                <>
                                    <Check size={16} /> Saved
                                </>
                            ) : (
                                <>
                                    <Save size={16} /> Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </main>
            </div>
        </div>
    )
}
