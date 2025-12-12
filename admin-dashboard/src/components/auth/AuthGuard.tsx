import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  // DEMO MODE: Bypass authentication to show dashboard
  // Remove this block and uncomment below for production
  return <>{children}</>

  /* PRODUCTION AUTH - Uncomment for real authentication
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="auth-guard-loading">
        <div className="spinner" />
        <p>Loading...</p>
        <style>{`
          .auth-guard-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: var(--color-bg-primary);
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--color-border);
            border-top-color: var(--color-gold-primary);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isAdmin) {
    return (
      <div className="auth-guard-error">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this dashboard.</p>
        <style>{`
          .auth-guard-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
            padding: var(--space-8);
          }
        `}</style>
      </div>
    )
  }

  return <>{children}</>
  */
}
