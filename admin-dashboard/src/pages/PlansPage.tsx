import { useState, useEffect } from 'react'
import { Check, Zap, Crown, Rocket, ArrowRight, Plus, X } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import styles from './PlansPage.module.css'
import { useAuth } from '../contexts/AuthContext'
import { subscriptionService, Plan, Subscription } from '../services/subscriptionService'
import { razorpayService } from '../services/razorpayService'
import { showError, showSuccess } from '../utils/swal'

export function PlansPage() {
    const { userData } = useAuth()
    const [plans, setPlans] = useState<Plan[]>([])
    const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
    const [loading, setLoading] = useState(true)
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
    const [showAddModal, setShowAddModal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form state for new plan
    const [newPlan, setNewPlan] = useState({
        name: '',
        description: '',
        price_monthly: 0,
        price_yearly: 0,
        max_gyms: 1,
        max_members_per_gym: 50,
        max_trainers_per_gym: 2,
        features: [''],
        is_active: true
    })

    useEffect(() => {
        async function fetchData() {
            try {
                const [plansData, subscription] = await Promise.all([
                    subscriptionService.getPlans(),
                    userData?.gymId ? subscriptionService.getCurrentSubscription(userData.gymId) : null
                ])
                setPlans(plansData)
                setCurrentSubscription(subscription)
            } catch (error) {
                console.error('Error fetching plans:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [userData])

    const handleUpgrade = async (plan: Plan) => {
        if (!userData?.gymId) {
            showError('Error', 'No gym ID found. Please contact support.')
            return
        }

        try {
            // 1. Create Order
            setLoading(true)
            const order = await razorpayService.createOrder(plan, billingCycle)

            // 2. Open Razorpay Checkout
            await razorpayService.openCheckout(
                order,
                plan,
                {
                    name: userData.profile.firstName + ' ' + userData.profile.lastName,
                    email: userData.profile.email,
                    phone: '' // Could add phone to profile if needed
                },
                async (response) => {
                    try {
                        // 3. Update subscription in DB
                        await subscriptionService.upgradeSubscription(
                            userData.gymId,
                            plan.id,
                            billingCycle
                        )

                        showSuccess(
                            'Payment Successful!',
                            `You have been upgraded to the ${plan.name} plan. Transaction ID: ${response.razorpay_payment_id}`
                        )

                        // 4. Refresh page data
                        const updatedSub = await subscriptionService.getCurrentSubscription(userData.gymId)
                        setCurrentSubscription(updatedSub)
                    } catch (err: any) {
                        showError('Subscription Update Failed', err.message)
                    }
                }
            )
        } catch (error: any) {
            showError('Order Creation Failed', error.message)
        } finally {
            setLoading(false)
        }
    }

    const getPlanIcon = (planName: string) => {
        switch (planName.toLowerCase()) {
            case 'free': return Zap
            case 'basic': return Check
            case 'pro': return Crown
            case 'enterprise': return Rocket
            default: return Check
        }
    }

    const getPlanColor = (planName: string) => {
        switch (planName.toLowerCase()) {
            case 'free': return '#6b7280'
            case 'basic': return '#3b82f6'
            case 'pro': return '#8b5cf6'
            case 'enterprise': return '#f59e0b'
            default: return '#3b82f6'
        }
    }

    const getPrice = (plan: Plan) => {
        if (plan.price_monthly === 0) return 'Free'
        const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly
        return `₹${price?.toLocaleString('en-IN')}`
    }

    const getSavings = (plan: Plan) => {
        if (!plan.price_yearly || plan.price_monthly === 0) return null
        const monthlyCost = plan.price_monthly * 12
        const savings = monthlyCost - plan.price_yearly
        const percentage = Math.round((savings / monthlyCost) * 100)
        return percentage
    }

    const isCurrentPlan = (planId: string) => {
        return currentSubscription?.plan.id === planId
    }

    // Handle adding a new feature to the list
    const handleAddFeature = () => {
        setNewPlan({ ...newPlan, features: [...newPlan.features, ''] })
    }

    // Handle removing a feature from the list
    const handleRemoveFeature = (index: number) => {
        const updatedFeatures = newPlan.features.filter((_, i) => i !== index)
        setNewPlan({ ...newPlan, features: updatedFeatures })
    }

    // Handle feature text change
    const handleFeatureChange = (index: number, value: string) => {
        const updatedFeatures = [...newPlan.features]
        updatedFeatures[index] = value
        setNewPlan({ ...newPlan, features: updatedFeatures })
    }

    // Handle form submission
    const handleSubmitPlan = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Filter out empty features
            const validFeatures = newPlan.features.filter(f => f.trim() !== '')

            // Insert into Supabase
            await subscriptionService.getPlans() // Just a sanity check or refresh

            // Use supabase client directly for insert
            const { supabase } = await import('../lib/supabase')
            const { error: insertError } = await supabase
                .from('saas_plans')
                .insert([{
                    name: newPlan.name,
                    description: newPlan.description,
                    price_monthly: newPlan.price_monthly,
                    price_yearly: newPlan.price_yearly,
                    max_gyms: newPlan.max_gyms,
                    max_members_per_gym: newPlan.max_members_per_gym,
                    max_trainers_per_gym: newPlan.max_trainers_per_gym,
                    features: validFeatures,
                    is_active: newPlan.is_active
                }])

            if (insertError) throw insertError

            // Refresh plans list
            const updatedPlans = await subscriptionService.getPlans()
            setPlans(updatedPlans)

            // Reset form and close modal
            setNewPlan({
                name: '',
                description: '',
                price_monthly: 0,
                price_yearly: 0,
                max_gyms: 1,
                max_members_per_gym: 50,
                max_trainers_per_gym: 2,
                features: [''],
                is_active: true
            })
            setShowAddModal(false)
            showSuccess('Plan Created', 'New subscription plan has been created successfully!')
        } catch (error: any) {
            console.error('Error creating plan:', error)
            showError('Error', 'Failed to create plan: ' + error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loading}>Loading plans...</div>
            </div>
        )
    }

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>Choose Your Plan</h1>
                <p className={styles.subtitle}>
                    Select the perfect plan for your gym. Upgrade or downgrade anytime.
                </p>
            </div>

            {/* Billing Toggle */}
            <div className={styles.billingToggle}>
                <button
                    className={`${styles.toggleBtn} ${billingCycle === 'monthly' ? styles.active : ''}`}
                    onClick={() => setBillingCycle('monthly')}
                >
                    Monthly
                </button>
                <button
                    className={`${styles.toggleBtn} ${billingCycle === 'yearly' ? styles.active : ''}`}
                    onClick={() => setBillingCycle('yearly')}
                >
                    Yearly
                    <span className={styles.saveBadge}>Save up to 20%</span>
                </button>
            </div>


            {/* Add New Plan Button (Gym Owners & Super Admin) */}
            {(userData?.role === 'gym_owner' || userData?.role === 'superadmin' || userData?.role === 'super_admin') && (
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        variant="primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={20} />
                        Add New Plan
                    </Button>
                </div>
            )}


            {/* Add Plan Modal */}
            {showAddModal && (
                <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Add New Plan</h2>
                            <button className={styles.closeBtn} onClick={() => setShowAddModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitPlan} className={styles.planForm}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Plan Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newPlan.name}
                                        onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                                        placeholder="e.g., Premium"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Description *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newPlan.description}
                                        onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                                        placeholder="e.g., Perfect for large gyms"
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Monthly Price (₹) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={newPlan.price_monthly}
                                        onChange={(e) => setNewPlan({ ...newPlan, price_monthly: Number(e.target.value) })}
                                        placeholder="999"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Yearly Price (₹) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={newPlan.price_yearly}
                                        onChange={(e) => setNewPlan({ ...newPlan, price_yearly: Number(e.target.value) })}
                                        placeholder="9990"
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Max Gyms *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={newPlan.max_gyms}
                                        onChange={(e) => setNewPlan({ ...newPlan, max_gyms: Number(e.target.value) })}
                                        placeholder="1"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Max Members per Gym *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={newPlan.max_members_per_gym}
                                        onChange={(e) => setNewPlan({ ...newPlan, max_members_per_gym: Number(e.target.value) })}
                                        placeholder="50"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Max Trainers per Gym *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={newPlan.max_trainers_per_gym}
                                        onChange={(e) => setNewPlan({ ...newPlan, max_trainers_per_gym: Number(e.target.value) })}
                                        placeholder="2"
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Features</label>
                                {newPlan.features.map((feature, index) => (
                                    <div key={index} className={styles.featureRow}>
                                        <input
                                            type="text"
                                            value={feature}
                                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                                            placeholder="e.g., Advanced Analytics"
                                        />
                                        {newPlan.features.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFeature(index)}
                                                className={styles.removeFeatureBtn}
                                            >
                                                <X size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddFeature}
                                    className={styles.addFeatureBtn}
                                >
                                    <Plus size={18} /> Add Feature
                                </button>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={newPlan.is_active}
                                        onChange={(e) => setNewPlan({ ...newPlan, is_active: e.target.checked })}
                                    />
                                    <span>Active (visible to users)</span>
                                </label>
                            </div>

                            <div className={styles.formActions}>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Plan'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Current Plan Banner */}
            {currentSubscription && (
                <div className={styles.currentPlanBanner}>
                    <div className={styles.bannerContent}>
                        <div>
                            <strong>Current Plan:</strong> {currentSubscription.plan.name}
                            {currentSubscription.status === 'trialing' && (
                                <span className={styles.trialBadge}>
                                    Trial - {subscriptionService.getDaysRemainingInTrial(currentSubscription)} days left
                                </span>
                            )}
                        </div>
                        {subscriptionService.isTrialEndingSoon(currentSubscription) && (
                            <div className={styles.bannerWarning}>
                                ⚠️ Your trial is ending soon. Upgrade now to continue using premium features.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Plans Grid */}
            <div className={styles.plansGrid}>
                {plans.map((plan) => {
                    const Icon = getPlanIcon(plan.name)
                    const color = getPlanColor(plan.name)
                    const savings = getSavings(plan)
                    const isCurrent = isCurrentPlan(plan.id)
                    const isPro = plan.name.toLowerCase() === 'pro'

                    return (
                        <Card
                            key={plan.id}
                            className={`${styles.planCard} ${isPro ? styles.featured : ''} ${isCurrent ? styles.current : ''}`}
                        >
                            {isPro && <div className={styles.popularBadge}>Most Popular</div>}
                            {isCurrent && <div className={styles.currentBadge}>Current Plan</div>}

                            <div className={styles.planHeader}>
                                <div className={styles.iconWrapper} style={{ backgroundColor: `${color}20` }}>
                                    <Icon size={32} color={color} />
                                </div>
                                <h3 className={styles.planName}>{plan.name}</h3>
                                <p className={styles.planDescription}>{plan.description}</p>
                            </div>

                            <div className={styles.pricing}>
                                <div className={styles.price}>
                                    {getPrice(plan)}
                                    {plan.price_monthly > 0 && (
                                        <span className={styles.period}>/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                                    )}
                                </div>
                                {billingCycle === 'yearly' && savings && (
                                    <div className={styles.savings}>Save {savings}%</div>
                                )}
                            </div>

                            <div className={styles.limits}>
                                <div className={styles.limitItem}>
                                    <strong>{plan.max_members_per_gym === 999999 ? 'Unlimited' : plan.max_members_per_gym}</strong>
                                    <span>Members per gym</span>
                                </div>
                                <div className={styles.limitItem}>
                                    <strong>{plan.max_trainers_per_gym === 999 ? 'Unlimited' : plan.max_trainers_per_gym}</strong>
                                    <span>Trainers per gym</span>
                                </div>
                                <div className={styles.limitItem}>
                                    <strong>{plan.max_gyms === 999 ? 'Unlimited' : plan.max_gyms}</strong>
                                    <span>Gym {plan.max_gyms === 1 ? 'Location' : 'Locations'}</span>
                                </div>
                            </div>

                            <div className={styles.features}>
                                {(plan.features as string[]).map((feature, index) => (
                                    <div key={index} className={styles.feature}>
                                        <Check size={18} color={color} />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                className={styles.upgradeBtn}
                                variant={isCurrent ? 'ghost' : isPro ? 'primary' : 'secondary'}
                                disabled={isCurrent}
                                onClick={() => handleUpgrade(plan)}
                                style={!isCurrent && isPro ? { backgroundColor: color } : {}}
                            >
                                {isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
                                {!isCurrent && <ArrowRight size={18} />}
                            </Button>
                        </Card>
                    )
                })}
            </div>

            {/* FAQ Section */}
            <div className={styles.faq}>
                <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
                <div className={styles.faqGrid}>
                    <div className={styles.faqItem}>
                        <h4>Can I change my plan anytime?</h4>
                        <p>Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
                    </div>
                    <div className={styles.faqItem}>
                        <h4>What payment methods do you accept?</h4>
                        <p>We accept all major credit/debit cards, UPI, net banking, and wallets through Razorpay.</p>
                    </div>
                    <div className={styles.faqItem}>
                        <h4>Is there a free trial?</h4>
                        <p>Yes! All paid plans come with a 14-day free trial. No credit card required to start.</p>
                    </div>
                    <div className={styles.faqItem}>
                        <h4>What happens if I exceed my limits?</h4>
                        <p>You'll be prompted to upgrade your plan. Your existing data remains safe and accessible.</p>
                    </div>
                </div>
            </div>

            {/* Support Banner */}
            <div className={styles.supportBanner}>
                <h3>Need help choosing a plan?</h3>
                <p>Our team is here to help you find the perfect plan for your gym.</p>
                <Button variant="secondary">Contact Support</Button>
            </div>
        </div>
    )
}
