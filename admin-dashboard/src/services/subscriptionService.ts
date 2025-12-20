import { supabase } from '../lib/supabase'

export interface Plan {
    id: string
    name: string
    description: string
    price_monthly: number
    price_yearly: number
    max_gyms: number
    max_members_per_gym: number | null
    max_trainers_per_gym: number | null
    features: string[]
    is_active: boolean
}

export interface Subscription {
    id: string
    gym_id: string
    plan_id: string
    plan: Plan
    status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired'
    billing_cycle: 'monthly' | 'yearly'
    start_date: string
    end_date: string | null
    trial_ends_at: string
    auto_renew: boolean
}

export interface UsageStats {
    memberCount: number
    trainerCount: number
    gymCount: number
}

export const subscriptionService = {
    // Get all available subscription plans
    async getPlans(): Promise<Plan[]> {
        const { data, error } = await supabase
            .from('saas_plans')
            .select('*')
            .eq('is_active', true)
            .order('price_monthly')

        if (error) throw error
        return data || []
    },

    // Get current subscription for a gym
    async getCurrentSubscription(gymId: string): Promise<Subscription | null> {
        const { data, error } = await supabase
            .from('gym_subscriptions')
            .select(`
                *,
                plan:saas_plans(*)
            `)
            .eq('gym_id', gymId)
            .single()

        if (error && error.code !== 'PGRST116') throw error
        return data as Subscription | null
    },

    // Get usage statistics for a gym
    async getUsageStats(gymId: string): Promise<UsageStats> {
        // Get member count
        const { count: memberCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('gym_id', gymId)
            .eq('role', 'member')

        // Get trainer count
        const { count: trainerCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('gym_id', gymId)
            .eq('role', 'trainer')

        // Get gym count for this owner
        const { data: currentGym } = await supabase
            .from('gyms')
            .select('owner_user_id')
            .eq('id', gymId)
            .single()

        let gymCount = 0
        if (currentGym) {
            const { count } = await supabase
                .from('gyms')
                .select('*', { count: 'exact', head: true })
                .eq('owner_user_id', currentGym.owner_user_id)

            gymCount = count || 0
        }

        return {
            memberCount: memberCount || 0,
            trainerCount: trainerCount || 0,
            gymCount
        }
    },

    // Check if user can add more members
    async canAddMember(gymId: string): Promise<{ allowed: boolean; reason?: string }> {
        const subscription = await this.getCurrentSubscription(gymId)
        if (!subscription) {
            return { allowed: false, reason: 'No active subscription found' }
        }

        if (subscription.status === 'expired' || subscription.status === 'canceled') {
            return { allowed: false, reason: 'Subscription is not active' }
        }

        const limit = subscription.plan.max_members_per_gym
        if (limit === null) {
            return { allowed: true } // Unlimited
        }

        const stats = await this.getUsageStats(gymId)
        if (stats.memberCount >= limit) {
            return {
                allowed: false,
                reason: `Member limit reached (${limit}). Please upgrade your plan.`
            }
        }

        return { allowed: true }
    },

    // Check if user can add more trainers
    async canAddTrainer(gymId: string): Promise<{ allowed: boolean; reason?: string }> {
        const subscription = await this.getCurrentSubscription(gymId)
        if (!subscription) {
            return { allowed: false, reason: 'No active subscription found' }
        }

        if (subscription.status === 'expired' || subscription.status === 'canceled') {
            return { allowed: false, reason: 'Subscription is not active' }
        }

        const limit = subscription.plan.max_trainers_per_gym
        if (limit === null) {
            return { allowed: true } // Unlimited
        }

        const stats = await this.getUsageStats(gymId)
        if (stats.trainerCount >= limit) {
            return {
                allowed: false,
                reason: `Trainer limit reached (${limit}). Please upgrade your plan.`
            }
        }

        return { allowed: true }
    },

    // Check if user can add more gyms
    async canAddGym(userId: string): Promise<{ allowed: boolean; reason?: string }> {
        // Get user's primary gym
        const { data: userGyms } = await supabase
            .from('gyms')
            .select('id')
            .eq('owner_user_id', userId)
            .limit(1)

        if (!userGyms || userGyms.length === 0) {
            return { allowed: true } // First gym is always allowed
        }

        const subscription = await this.getCurrentSubscription(userGyms[0].id)
        if (!subscription) {
            return { allowed: false, reason: 'No active subscription found' }
        }

        const limit = subscription.plan.max_gyms
        if (limit === null || limit === 999) {
            return { allowed: true } // Unlimited
        }

        const stats = await this.getUsageStats(userGyms[0].id)
        if (stats.gymCount >= limit) {
            return {
                allowed: false,
                reason: `Gym location limit reached (${limit}). Please upgrade your plan.`
            }
        }

        return { allowed: true }
    },

    // Get days remaining in trial
    getDaysRemainingInTrial(subscription: Subscription): number {
        if (subscription.status !== 'trialing') return 0

        const trialEnd = new Date(subscription.trial_ends_at)
        const now = new Date()
        const diff = trialEnd.getTime() - now.getTime()
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

        return Math.max(0, days)
    },

    // Check if subscription is about to expire
    isTrialEndingSoon(subscription: Subscription): boolean {
        if (subscription.status !== 'trialing') return false
        return this.getDaysRemainingInTrial(subscription) <= 3
    },

    // Self-healing: Activate Free Plan if missing
    async activateFreePlan(gymId: string): Promise<boolean> {
        try {
            const { data: freePlan } = await supabase
                .from('saas_plans')
                .select('id')
                .eq('name', 'Free')
                .single()

            if (!freePlan) return false

            const { error } = await supabase
                .from('gym_subscriptions')
                .insert({
                    gym_id: gymId,
                    plan_id: freePlan.id,
                    status: 'active',
                    billing_cycle: 'monthly',
                    start_date: new Date().toISOString(),
                    auto_renew: true
                })

            return !error
        } catch (e) {
            console.error('Error activating free plan:', e)
            return false
        }
    },

    // Upgrade subscription after successful payment
    async upgradeSubscription(gymId: string, planId: string, billingCycle: 'monthly' | 'yearly') {
        const { error } = await supabase
            .from('gym_subscriptions')
            .update({
                plan_id: planId,
                status: 'active',
                billing_cycle: billingCycle,
                start_date: new Date().toISOString(),
                end_date: billingCycle === 'monthly'
                    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                trial_ends_at: null, // End trial on paid upgrade
                auto_renew: true
            })
            .eq('gym_id', gymId)

        if (error) throw error
    }
}
