import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Dumbbell, Mail, Lock, Eye, EyeOff, User, MapPin, Phone, Building2, Check, ArrowRight, Home } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import styles from './LoginPage.module.css'
import { showSuccess, showError } from '../utils/swal'
import { razorpayService } from '../services/razorpayService'

interface Plan {
    id: string
    name: string
    price_monthly: number
    features: string[] | string
}

export function RegisterPage() {
    // State
    const [step, setStep] = useState(1) // 1: Owner, 2: Gym, 3: Plan
    const [plans, setPlans] = useState<Plan[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        // Owner Details
        full_name: '',
        email: '',
        owner_address: '',
        owner_city: '',
        owner_phone: '',
        password: '',
        confirm_password: '',

        // Gym Details
        gym_name: '',
        gym_location: '', // Detailed address
        gym_city: '',
        gym_type: 'unisex',
        gym_contact: ''
    })

    // Fetch Plans on load
    useEffect(() => {
        async function loadPlans() {
            const { data } = await supabase
                .from('saas_plans')
                .select('*')
                .eq('is_active', true)
                .order('price_monthly')
            if (data) setPlans(data)
        }
        loadPlans()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    // Step Navigation
    const handleNext = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validation Step 1
        if (step === 1) {
            if (!formData.full_name || !formData.email || !formData.owner_phone || !formData.password) {
                setError('Please fill all required fields')
                return
            }
            if (formData.password !== formData.confirm_password) {
                setError('Passwords do not match')
                return
            }
            setStep(2)
        }
        // Validation Step 2
        else if (step === 2) {
            if (!formData.gym_name || !formData.gym_location || !formData.gym_city || !formData.gym_contact) {
                setError('Please fill all gym details')
                return
            }
            setStep(3)
        }
    }

    // Final Submission
    const handleRegister = async (selectedPlan: Plan) => {
        setIsLoading(true)
        setError('')

        try {
            const email = formData.email.trim()
            const password = formData.password.trim()

            // Basic Client-side Validation
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                setError('Please enter a valid email address.')
                setIsLoading(false)
                return
            }

            // Check if plan is free tier
            const isFreePlan = selectedPlan.price_monthly === 0 || razorpayService.isFreeTier(selectedPlan.name)

            console.log('Registration - Plan details:', {
                planName: selectedPlan.name,
                price: selectedPlan.price_monthly,
                isFreePlan
            });

            // If paid plan, process payment first
            if (!isFreePlan) {
                console.log('Opening payment modal for paid plan...');

                await new Promise((resolve, reject) => {
                    razorpayService.openMembershipCheckout(
                        {
                            gymId: '', // Will be set after gym creation
                            memberName: formData.full_name,
                            memberEmail: email,
                            memberPhone: formData.owner_phone,
                            planName: selectedPlan.name,
                            planPrice: selectedPlan.price_monthly
                        },
                        async (response) => {
                            // Payment successful - proceed with registration
                            console.log('Payment successful:', response);
                            try {
                                await completeRegistration(selectedPlan, email, password, response)
                                resolve(true)
                            } catch (error) {
                                console.error('Error in completeRegistration:', error);
                                reject(error)
                            }
                        },
                        (error) => {
                            // Payment failed or cancelled
                            console.error('Payment failed/cancelled:', error);
                            setIsLoading(false)
                            if (error.message !== 'Payment cancelled by user') {
                                showError('Payment Failed', error.message || 'Payment was not completed. Registration cancelled.')
                            }
                            reject(error)
                        }
                    )
                })
            } else {
                console.log('Free plan - skipping payment');
                // Free plan - no payment required
                await completeRegistration(selectedPlan, email, password, null)
            }

        } catch (err: any) {
            console.error('Registration error:', err)
            if (err.message !== 'Payment cancelled by user') {
                if (err.message?.includes('security purposes') || err.message?.includes('rate limit')) {
                    setError('Too many attempts. Please wait a moment or use a different email address.')
                } else if (err.message?.includes('User already registered')) {
                    setError('This email is already registered. Please sign in or use a different email.')
                } else {
                    setError(err.message || 'Something went wrong during registration.')
                }
            }
        } finally {
            setIsLoading(false)
        }
    }

    // Complete registration after payment (or for free plans)
    const completeRegistration = async (
        selectedPlan: Plan,
        email: string,
        password: string,
        paymentResponse: any
    ) => {
        // 1. Sign Up (Auth)
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: formData.full_name,
                    role: 'gym_owner' // Explicitly setting this role
                }
            }
        })

        if (authError) throw authError
        if (!authData.user) throw new Error('Registration failed')

        const userId = authData.user.id

        // 2. Update User Profile (Owner Details)
        const { error: profileError } = await supabase.from('users').update({
            display_name: formData.full_name,
            phone: formData.owner_phone,
            address: formData.owner_address,
            city: formData.owner_city,
        }).eq('id', userId)

        if (profileError) console.error('Profile update warning:', profileError)

        // 3. Create Gym & Subscription (Using RPC to bypass RLS)
        const { data: gymData, error: gymError } = await supabase.rpc('create_new_gym', {
            _owner_id: userId,
            _name: formData.gym_name,
            _owner_name: formData.full_name,
            _location: formData.gym_location,
            _city: formData.gym_city,
            _type: formData.gym_type,
            _contact: formData.gym_contact,
            _plan_id: selectedPlan.id,
            _price: selectedPlan.price_monthly,
            _currency: 'INR',
            _plan_details: selectedPlan,
            _email: email,
            _phone: formData.owner_phone,
            _address: formData.owner_address,
            _owner_city: formData.owner_city
        })

        if (gymError) throw gymError
        const createdGymId = gymData.gym_id

        // 4. Link Gym to User
        await supabase.from('users').update({ gym_id: createdGymId }).eq('id', userId)

        // 5. Record payment if this was a paid plan
        if (paymentResponse) {
            try {
                await razorpayService.recordMembershipPayment({
                    gymId: createdGymId,
                    amount: selectedPlan.price_monthly,
                    razorpayOrderId: paymentResponse.razorpay_order_id,
                    razorpayPaymentId: paymentResponse.razorpay_payment_id,
                    razorpaySignature: paymentResponse.razorpay_signature,
                    planName: selectedPlan.name,
                    memberName: formData.full_name
                })
            } catch (paymentError) {
                console.error('Error recording payment:', paymentError)
                // Don't fail registration if payment recording fails
            }
        }

        // Success
        await showSuccess(
            'Registration Successful!',
            paymentResponse
                ? 'Payment received! Welcome to FitZone. Please sign in to continue.'
                : 'Welcome to FitZone. Please sign in to continue.'
        )
        navigate('/login')
    }

    return (
        <div className={styles.page}>
            <div className={styles.container} style={{ maxWidth: step === 3 ? '1000px' : '500px', transition: 'max-width 0.3s' }}>
                <div className={styles.logo}>
                    <Dumbbell className={styles.logoIcon} />
                    <span className={styles.logoText}>FitZone for Owners</span>
                </div>

                {/* Progress Bar */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', gap: '10px' }}>
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{
                            width: '30px', height: '30px',
                            borderRadius: '50%',
                            background: step >= s ? '#eab308' : '#e2e8f0',
                            color: step >= s ? 'white' : '#64748b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold', fontSize: '0.9rem'
                        }}>
                            {s}
                        </div>
                    ))}
                </div>

                <div className={styles.header}>
                    <h1>
                        {step === 1 && 'Owner Details'}
                        {step === 2 && 'Gym Information'}
                        {step === 3 && 'Select a Plan'}
                    </h1>
                    <p>
                        {step === 1 && 'Tell us about yourself'}
                        {step === 2 && 'Tell us about your fitness center'}
                        {step === 3 && 'Choose your business toolkit'}
                    </p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                {/* STEP 1: OWNER DETAILS */}
                {step === 1 && (
                    <form onSubmit={handleNext} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Owner Name</label>
                            <div className={styles.inputWrapper}>
                                <User size={18} className={styles.inputIcon} />
                                <input name="full_name" value={formData.full_name} onChange={handleChange} required placeholder="Full Name" />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Email</label>
                            <div className={styles.inputWrapper}>
                                <Mail size={18} className={styles.inputIcon} />
                                <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="Email Address" />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Mobile No.</label>
                            <div className={styles.inputWrapper}>
                                <Phone size={18} className={styles.inputIcon} />
                                <input name="owner_phone" value={formData.owner_phone} onChange={handleChange} required placeholder="Contact Number" />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Address</label>
                            <div className={styles.inputWrapper}>
                                <Home size={18} className={styles.inputIcon} />
                                <input name="owner_address" value={formData.owner_address} onChange={handleChange} required placeholder="Street Address" />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>City</label>
                            <div className={styles.inputWrapper}>
                                <MapPin size={18} className={styles.inputIcon} />
                                <input name="owner_city" value={formData.owner_city} onChange={handleChange} required placeholder="City" />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Password</label>
                            <div className={styles.inputWrapper}>
                                <Lock size={18} className={styles.inputIcon} />
                                <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} required placeholder="Password" />
                                <button type="button" className={styles.togglePassword} onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Confirm Password</label>
                            <div className={styles.inputWrapper}>
                                <Lock size={18} className={styles.inputIcon} />
                                <input name="confirm_password" type="password" value={formData.confirm_password} onChange={handleChange} required placeholder="Confirm Password" />
                            </div>
                        </div>
                        <Button type="submit" className={styles.submitBtn}>Next <ArrowRight size={18} /></Button>
                        <p className={styles.footer}>Already have an account? <Link to="/login">Sign in</Link></p>
                    </form>
                )}

                {/* STEP 2: GYM DETAILS */}
                {step === 2 && (
                    <form onSubmit={handleNext} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Gym Name</label>
                            <div className={styles.inputWrapper}>
                                <Dumbbell size={18} className={styles.inputIcon} />
                                <input name="gym_name" value={formData.gym_name} onChange={handleChange} required placeholder="e.g. Iron Paradise" />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Type</label>
                            <select
                                name="gym_type"
                                value={formData.gym_type}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.5rem',
                                    marginTop: '5px'
                                }}
                            >
                                <option value="unisex">Unisex</option>
                                <option value="male">Male Only</option>
                                <option value="female">Female Only</option>
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Gym Location (Area/Street)</label>
                            <div className={styles.inputWrapper}>
                                <MapPin size={18} className={styles.inputIcon} />
                                <input name="gym_location" value={formData.gym_location} onChange={handleChange} required placeholder="e.g. Sector 18, Main Road" />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Gym City</label>
                            <div className={styles.inputWrapper}>
                                <Building2 size={18} className={styles.inputIcon} />
                                <input name="gym_city" value={formData.gym_city} onChange={handleChange} required placeholder="e.g. Mumbai" />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Gym Contact No.</label>
                            <div className={styles.inputWrapper}>
                                <Phone size={18} className={styles.inputIcon} />
                                <input name="gym_contact" value={formData.gym_contact} onChange={handleChange} required placeholder="Front Desk Number" />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Button type="button" variant="ghost" onClick={() => setStep(1)} style={{ flex: 1 }}>Back</Button>
                            <Button type="submit" className={styles.submitBtn} style={{ flex: 2 }}>Next <ArrowRight size={18} /></Button>
                        </div>
                    </form>
                )}

                {/* STEP 3: PLANS */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
                            {plans.map((plan) => {
                                const features = typeof plan.features === 'string' ? JSON.parse(plan.features) : (plan.features || [])
                                return (
                                    <div key={plan.id}
                                        onClick={() => handleRegister(plan)}
                                        style={{
                                            border: '2px solid transparent',
                                            borderRadius: '12px',
                                            padding: '25px',
                                            background: 'white',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s hover:transform hover:scale-105 hover:border-yellow-400'
                                        }}>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{plan.name}</h3>
                                        <div style={{ fontSize: '2rem', fontWeight: '800', margin: '10px 0', color: '#eab308' }}>
                                            ₹{plan.price_monthly}<span style={{ fontSize: '1rem', color: '#94a3b8' }}>/mo</span>
                                        </div>
                                        <hr style={{ margin: '15px 0', borderColor: '#f1f5f9' }} />
                                        <ul style={{ listStyle: 'none', padding: 0 }}>
                                            {Array.isArray(features) && features.map((f: string, i: number) => (
                                                <li key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '0.95rem', color: '#475569' }}>
                                                    <Check size={18} color="#22c55e" /> {f}
                                                </li>
                                            ))}
                                        </ul>
                                        <Button style={{ width: '100%', marginTop: '15px' }} isLoading={isLoading}>Select {plan.name}</Button>
                                    </div>
                                )
                            })}
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            <Button type="button" variant="ghost" onClick={() => setStep(2)}>Back to Gym Details</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
