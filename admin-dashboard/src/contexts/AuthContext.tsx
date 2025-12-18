import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type UserRole = 'member' | 'trainer' | 'admin' | 'superadmin' | 'gym_owner'

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
    refreshUser: () => Promise<void>
    createGym: (name?: string) => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [userData, setUserData] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchUserData = async (userId: string) => {
        try {
            let { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()

            // If user record missing, try to create it
            if (!data && (error?.code === 'PGRST116' || error?.message?.includes('JSON'))) {
                console.log('User profile missing, creating one...')
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.user) {
                    const newUser = {
                        id: userId,
                        email: session.user.email,
                        role: 'admin', // Default to admin for this SaaS
                        display_name: session.user.email?.split('@')[0]
                    }
                    const { data: createdUser, error: createError } = await supabase
                        .from('users')
                        .insert([newUser])
                        .select()
                        .single()

                    if (createError) throw createError
                    data = createdUser
                }
            } else if (error) {
                throw error
            }

            if (data) {
                // If Gym ID is missing, try to create a Gym
                if (!data.gym_id && (data.role === 'admin' || data.role === 'superadmin')) {
                    console.log('Gym missing for admin, creating one...')
                    const { data: newGym, error: gymError } = await supabase
                        .from('gyms')
                        .insert([{
                            name: 'My Gym',
                            slug: 'gym-' + Math.random().toString(36).substring(7),
                            owner_user_id: userId,
                            status: 'active'
                        }])
                        .select()
                        .single()

                    if (!gymError && newGym) {
                        // Link Gym to User
                        const { data: updatedUser, error: updateError } = await supabase
                            .from('users')
                            .update({ gym_id: newGym.id })
                            .eq('id', userId)
                            .select()
                            .single()

                        if (!updateError) data = updatedUser
                    } else {
                        console.error('Failed to auto-create gym:', gymError)
                    }
                }

                // Check for missing subscription (Self-healing)
                if (data.gym_id && (data.role === 'admin' || data.role === 'superadmin')) {
                    const { data: sub } = await supabase
                        .from('gym_subscriptions')
                        .select('id')
                        .eq('gym_id', data.gym_id)
                        .maybeSingle()

                    if (!sub) {
                        console.log('Detailed check: missing subscription for gym', data.gym_id)
                        const { data: freePlan } = await supabase
                            .from('saas_plans')
                            .select('id')
                            .eq('name', 'Free')
                            .single()

                        if (freePlan) {
                            await supabase.from('gym_subscriptions').insert({
                                gym_id: data.gym_id,
                                plan_id: freePlan.id,
                                status: 'active', // Free plan is always active
                                billing_cycle: 'monthly',
                                start_date: new Date().toISOString(),
                                auto_renew: true
                            })
                            console.log('Self-healed: Created missing subscription')
                        }
                    }
                }

                // Map DB user to UserData interface
                const mappedData: UserData = {
                    id: data.id,
                    role: data.role as UserRole,
                    gymId: data.gym_id,
                    branchId: data.branch_id,
                    profile: {
                        firstName: data.first_name || '',
                        lastName: data.last_name || '',
                        email: data.email || ''
                    }
                }
                setUserData(mappedData)
            }
        } catch (err) {
            console.error('Error fetching/creating user data:', err)
        }
    }

    useEffect(() => {
        // Skip Supabase auth check if keys are missing
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
            setLoading(false)
            return
        }

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchUserData(session.user.id)
            } else {
                setLoading(false)
            }
        })

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchUserData(session.user.id).then(() => setLoading(false))
            } else {
                setUserData(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const signIn = async (email: string, password: string) => {
        setError(null)



        // Only try real auth if credentials exist
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
            setError('Supabase not configured. Please use demo credentials: admin@fitzone.com / password123')
            return
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (signInError) {
            setError(signInError.message)
            throw signInError
        }
    }

    const signOut = async () => {

        // Also clear Supabase session if using it
        if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
            await supabase.auth.signOut()
        }

        setUser(null)
        setUserData(null)
    }

    // Default to admin during dev if no user data found (or based on mock)
    // In real app, check `userData?.role`
    const isAdmin = userData?.role === 'admin' || userData?.role === 'superadmin' || userData?.role === 'gym_owner' || user?.id === 'mock-admin-id'
    const isSuperAdmin = userData?.role === 'superadmin' || user?.id === 'mock-admin-id'

    const refreshUser = async () => {
        if (user) {
            await fetchUserData(user.id)
        }
    }

    const createGym = async (name: string = 'My Gym'): Promise<string | null> => {
        if (!user) return null
        try {
            // 1. Create Gym
            const { data: newGym, error: gymError } = await supabase
                .from('gyms')
                .insert([{
                    name: name,
                    slug: 'gym-' + Math.random().toString(36).substring(7),
                    owner_user_id: user.id,
                    status: 'active'
                }])
                .select()
                .single()

            if (gymError) throw gymError

            console.log('Gym created:', newGym.id)

            // 2. Link to User
            const { error: updateError } = await supabase
                .from('users')
                .update({ gym_id: newGym.id })
                .eq('id', user.id)

            if (updateError) {
                console.warn('Failed to link user to new gym (non-fatal):', updateError)
            } else {
                console.log('User linked to gym')
            }

            // 3. Assign Default 'Free' Plan
            const { data: freePlan, error: planError } = await supabase
                .from('saas_plans')
                .select('id')
                .eq('name', 'Free')
                .single()

            if (freePlan) {
                const startDate = new Date().toISOString()
                // Set trial end date to 14 days from now (if applicable, though Free plan is forever) 
                // OR just make it active. Let's make it active.

                const { error: subError } = await supabase
                    .from('gym_subscriptions')
                    .insert({
                        gym_id: newGym.id,
                        plan_id: freePlan.id,
                        status: 'active',
                        billing_cycle: 'monthly',
                        start_date: startDate,
                        auto_renew: true
                    })

                if (subError) {
                    console.error('Failed to create default subscription:', subError)
                } else {
                    console.log('Default Free subscription created')
                }
            } else {
                console.warn('Free plan not found, skipping subscription creation', planError)
            }

            // 4. Refresh Profile
            await fetchUserData(user.id)
            return newGym.id
        } catch (e) {
            console.error('Error creating gym:', e)
            return null
        }
    }

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
                refreshUser,
                createGym
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
