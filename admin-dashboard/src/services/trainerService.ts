import { supabase } from '../lib/supabase'

export interface TrainerUI {
    id: string
    full_name: string
    phone: string
    email: string
    specializations: string[]
    clients: number
    max_clients: number
    rating: number
    experience_years: number
    status: 'active' | 'on_leave' | 'inactive'
    joined_date: string
}

export const trainerService = {
    async getTrainers(gymId: string): Promise<TrainerUI[]> {
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('gym_id', gymId)
            .eq('role', 'trainer')
            .order('created_at', { ascending: false })

        if (error) throw error

        return (users || []).map((user: any) => {
            const details = user.trainer_details || {}
            return {
                id: user.id,
                full_name: user.display_name || 'Unknown Trainer',
                phone: user.phone || '',
                email: user.email || '',
                specializations: details.specializations || [],
                clients: details.current_clients || 0,
                max_clients: details.max_clients || 20,
                rating: details.rating || 5.0,
                experience_years: details.experience || 0,
                status: user.status || 'active',
                joined_date: new Date(user.created_at).toISOString().split('T')[0]
            }
        })
    },

    async createTrainer(trainerData: any) {
        // 1. Create auth user (optional? Usually admins invite trainers via email)
        // For now, we'll just insert into public.users and assume auth is handled or they are "placeholder" trainers
        // Note: Real auth requires signUp, but for management list we might just insert rows.
        // However, RLS policy "Insert own profile" restricts inserting others.
        // CHECK POLICY: "Manage gym users" allows admins to insert into users!

        const dbUser = {
            gym_id: trainerData.gym_id,
            role: 'trainer',
            email: trainerData.email,
            phone: trainerData.phone,
            display_name: trainerData.full_name,
            status: trainerData.status,
            trainer_details: {
                specializations: trainerData.specializations,
                max_clients: trainerData.max_clients,
                experience: trainerData.experience_years,
                rating: 5.0,
                current_clients: 0
            }
        }

        const { data, error } = await supabase
            .from('users')
            .insert([dbUser])
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateTrainer(id: string, updates: any) {
        // Fetch existing to merge details
        const { data: existing, error: fetchError } = await supabase
            .from('users')
            .select('trainer_details')
            .eq('id', id)
            .single()

        if (fetchError) throw fetchError

        const currentDetails = existing?.trainer_details || {}

        const dbUpdates: any = {}
        if (updates.full_name) dbUpdates.display_name = updates.full_name
        if (updates.phone) dbUpdates.phone = updates.phone
        if (updates.email) dbUpdates.email = updates.email
        if (updates.status) dbUpdates.status = updates.status

        // Merge details
        const newDetails = { ...currentDetails }
        if (updates.specializations) newDetails.specializations = updates.specializations
        if (updates.max_clients) newDetails.max_clients = updates.max_clients
        if (updates.experience_years) newDetails.experience = updates.experience_years

        dbUpdates.trainer_details = newDetails

        const { data, error } = await supabase
            .from('users')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async deleteTrainer(id: string) {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    }
}
