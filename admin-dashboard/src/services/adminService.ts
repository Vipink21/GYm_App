import { supabase } from '../lib/supabase'

export interface GymDetails {
    id: string
    name: string
    location: string
    city: string
    type: string
    contact_no: string
    status: string
    created_at: string
    owner: {
        display_name: string
        email: string
        phone: string
    }
    subscription: {
        status: string
        plan: {
            name: string
        }
    }[]
}

export const adminService = {
    // Get all gyms with owner and plan details
    async getAllGyms(): Promise<GymDetails[]> {
        const { data, error } = await supabase
            .from('gyms')
            .select(`
                *,
                owner:users!gyms_owner_user_id_fkey (
                    display_name,
                    email,
                    phone
                ),
                subscription:gym_subscriptions (
                    status,
                    plan:saas_plans (name)
                )
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching gyms:', error)
            throw error
        }

        return data || []
    },

    // Delete a gym (Cascade DELETE will handle sub-data if configured, else manual)
    async deleteGym(gymId: string): Promise<void> {
        const { error } = await supabase
            .from('gyms')
            .delete()
            .eq('id', gymId)

        if (error) throw error
    }
}
