import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Dumbbell, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import styles from './LoginPage.module.css'

export function LoginPage() {
    const [email, setEmail] = useState('admin@fitzone.com')
    const [password, setPassword] = useState('password123')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const { signIn } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const from = (location.state as any)?.from?.pathname || '/'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            await signIn(email, password)
            // The AuthContext will update, we need to check the role
            // Since signIn is async and sets state, we can't immediately check 'userData' here 
            // but we can trust the AuthGuard/App logic or handle it in a useEffect.
            // For now, let's keep the redirect simple but check if it's the default admin
            if (email === 'admin@fitzone.com') {
                navigate('/admin', { replace: true })
            } else {
                navigate(from, { replace: true })
            }
        } catch (err: any) {
            setError(err.message || 'Failed to sign in')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* Logo */}
                <div className={styles.logo}>
                    <Dumbbell className={styles.logoIcon} />
                    <span className={styles.logoText}>FitZone Admin</span>
                </div>

                {/* Welcome Text */}
                <div className={styles.header}>
                    <h1>Welcome Back!</h1>
                    <p>Sign in to access your dashboard</p>
                </div>

                {/* Error Message */}
                {error && <div className={styles.error}>{error}</div>}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Email Address</label>
                        <div className={styles.inputWrapper}>
                            <Mail size={18} className={styles.inputIcon} />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@fitzone.com"
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Password</label>
                        <div className={styles.inputWrapper}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                className={styles.togglePassword}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" isLoading={isLoading} className={styles.submitBtn}>
                        Sign In
                    </Button>
                </form>

                <p className={styles.footer}>
                    Don't have an account? <Link to="/register">Sign up</Link>
                </p>
            </div>
        </div>
    )
}
