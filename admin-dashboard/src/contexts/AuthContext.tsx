import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
    User,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

export type UserRole = 'member' | 'trainer' | 'admin' | 'superadmin'

interface UserData {
    id: string
    role: UserRole
    gymId: string
    branchId: string
    profile: {
        firstName: string
        lastName: string
        email: string
        photoUrl?: string
    }
}

interface AuthContextType {
    user: User | null
    userData: UserData | null
    loading: boolean
    error: string | null
    signIn: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
    isAdmin: boolean
    isSuperAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [userData, setUserData] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser)

            if (firebaseUser) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
                    if (userDoc.exists()) {
                        setUserData({ id: userDoc.id, ...userDoc.data() } as UserData)
                    }
                } catch (err) {
                    console.error('Error fetching user data:', err)
                }
            } else {
                setUserData(null)
            }

            setLoading(false)
        })

        return unsubscribe
    }, [])

    const signIn = async (email: string, password: string) => {
        setError(null)
        try {
            await signInWithEmailAndPassword(auth, email, password)
        } catch (err: any) {
            setError(err.message || 'Failed to sign in')
            throw err
        }
    }

    const signOut = async () => {
        await firebaseSignOut(auth)
        setUserData(null)
    }

    const isAdmin = userData?.role === 'admin' || userData?.role === 'superadmin'
    const isSuperAdmin = userData?.role === 'superadmin'

    return (
        <AuthContext.Provider
            value={{
                user,
                userData,
                loading,
                error,
                signIn,
                signOut,
                isAdmin,
                isSuperAdmin,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
