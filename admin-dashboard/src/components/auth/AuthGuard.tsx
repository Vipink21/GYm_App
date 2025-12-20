import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth()
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

  // Handle protected admin routes
  if (location.pathname.startsWith('/admin')) {
    const isSuperAdmin = user.email === 'admin@fitzone.com' || (user as any).role === 'superadmin' || (user as any).role === 'super_admin';
    if (!isSuperAdmin) {
      console.warn('Unauthorized access to admin route:', location.pathname);
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>
}
