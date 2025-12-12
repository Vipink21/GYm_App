import { Save, Building, Bell, Shield, CreditCard, Clock, Users } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import styles from './SettingsPage.module.css'

export function SettingsPage() {
    return (
        <div className={styles.page}>
            {/* Settings Navigation */}
            <div className={styles.layout}>
                <aside className={styles.sidebar}>
                    <nav className={styles.nav}>
                        <a href="#gym" className={`${styles.navItem} ${styles.active}`}>
                            <Building size={18} /> Gym Profile
                        </a>
                        <a href="#hours" className={styles.navItem}>
                            <Clock size={18} /> Operating Hours
                        </a>
                        <a href="#membership" className={styles.navItem}>
                            <Users size={18} /> Membership Plans
                        </a>
                        <a href="#payments" className={styles.navItem}>
                            <CreditCard size={18} /> Payment Settings
                        </a>
                        <a href="#notifications" className={styles.navItem}>
                            <Bell size={18} /> Notifications
                        </a>
                        <a href="#security" className={styles.navItem}>
                            <Shield size={18} /> Security
                        </a>
                    </nav>
                </aside>

                <main className={styles.content}>
                    {/* Gym Profile Section */}
                    <Card id="gym" className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <Building size={20} /> Gym Profile
                        </h2>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Gym Name</label>
                                <input type="text" defaultValue="FitZone Premium" className={styles.input} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Branch Name</label>
                                <input type="text" defaultValue="Downtown Branch" className={styles.input} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email</label>
                                <input type="email" defaultValue="hello@fitzone.com" className={styles.input} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Phone</label>
                                <input type="tel" defaultValue="+91 98765 43210" className={styles.input} />
                            </div>
                            <div className={styles.formGroupFull}>
                                <label>Address</label>
                                <textarea
                                    className={styles.textarea}
                                    defaultValue="123 Fitness Street, MG Road, Bengaluru, Karnataka 560001"
                                    rows={2}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Operating Hours */}
                    <Card id="hours" className={styles.section}>
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

                    {/* Notification Settings */}
                    <Card id="notifications" className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <Bell size={20} /> Notification Settings
                        </h2>
                        <div className={styles.toggleList}>
                            <div className={styles.toggleItem}>
                                <div>
                                    <span className={styles.toggleLabel}>Membership Expiry Reminders</span>
                                    <span className={styles.toggleDesc}>Send notifications 7, 3, and 1 day before expiry</span>
                                </div>
                                <label className={styles.toggle}>
                                    <input type="checkbox" defaultChecked={true} />
                                    <span className={styles.toggleSlider}></span>
                                </label>
                            </div>
                            <div className={styles.toggleItem}>
                                <div>
                                    <span className={styles.toggleLabel}>Class Reminders</span>
                                    <span className={styles.toggleDesc}>Remind members 1 hour before booked classes</span>
                                </div>
                                <label className={styles.toggle}>
                                    <input type="checkbox" defaultChecked={true} />
                                    <span className={styles.toggleSlider}></span>
                                </label>
                            </div>
                            <div className={styles.toggleItem}>
                                <div>
                                    <span className={styles.toggleLabel}>Payment Confirmation</span>
                                    <span className={styles.toggleDesc}>Send receipt after successful payment</span>
                                </div>
                                <label className={styles.toggle}>
                                    <input type="checkbox" defaultChecked={true} />
                                    <span className={styles.toggleSlider}></span>
                                </label>
                            </div>
                            <div className={styles.toggleItem}>
                                <div>
                                    <span className={styles.toggleLabel}>Promotional Messages</span>
                                    <span className={styles.toggleDesc}>Send offers and promotional content</span>
                                </div>
                                <label className={styles.toggle}>
                                    <input type="checkbox" defaultChecked={false} />
                                    <span className={styles.toggleSlider}></span>
                                </label>
                            </div>
                        </div>
                    </Card>

                    {/* Payment Settings */}
                    <Card id="payments" className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <CreditCard size={20} /> Payment Settings
                        </h2>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Razorpay Key ID</label>
                                <input type="text" placeholder="rzp_live_xxxxx" className={styles.input} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Razorpay Secret</label>
                                <input type="password" placeholder="••••••••••••" className={styles.input} />
                            </div>
                            <div className={styles.formGroupFull}>
                                <label>Payment Methods</label>
                                <div className={styles.checkboxGroup}>
                                    <label className={styles.checkbox}>
                                        <input type="checkbox" defaultChecked /> UPI
                                    </label>
                                    <label className={styles.checkbox}>
                                        <input type="checkbox" defaultChecked /> Credit/Debit Card
                                    </label>
                                    <label className={styles.checkbox}>
                                        <input type="checkbox" defaultChecked /> Net Banking
                                    </label>
                                    <label className={styles.checkbox}>
                                        <input type="checkbox" defaultChecked /> Cash (In-Person)
                                    </label>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Save Button */}
                    <div className={styles.actions}>
                        <Button variant="secondary">Cancel</Button>
                        <Button>
                            <Save size={16} /> Save Changes
                        </Button>
                    </div>
                </main>
            </div>
        </div>
    )
}
