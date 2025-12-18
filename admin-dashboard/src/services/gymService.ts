import { supabase } from '../lib/supabase'

export interface GymUI {
    id: string
    name: string
    slug: string
    owner_id: string
    status: 'active' | 'inactive' | 'pending'
    location?: string
    address?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
    contact_no?: string
    owner_name?: string
    gym_category?: 'Unisex' | 'Only Men' | 'Only Women'
    created_at: string
}

export const gymService = {
    async getGyms(): Promise<GymUI[]> {
        // Fetch valid gyms.
        // For admin, this will likely only return their own gym due to RLS.
        // For superadmin, it might return all.
        const { data, error } = await supabase
            .from('gyms')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        return (data || []).map((g: any) => ({
            id: g.id,
            name: g.name,
            slug: g.slug,
            owner_id: g.owner_user_id,
            status: g.status,
            location: g.location || '',
            address: g.address || '',
            city: g.city || '',
            state: g.state || '',
            postal_code: g.postal_code || '',
            country: g.country || 'India',
            contact_no: g.contact_no || '',
            owner_name: g.owner_name || '',
            gym_category: g.gym_category || 'Unisex',
            created_at: new Date(g.created_at).toLocaleDateString()
        }))
    },

    async createGym(gymData: {
        name: string,
        owner_user_id: string,
        location?: string,
        contact_no?: string,
        owner_name?: string,
        gym_category?: string,
        slug?: string
    }) {
        const slug = gymData.slug || 'gym-' + Math.random().toString(36).substring(7)

        const { data, error } = await supabase
            .from('gyms')
            .insert([{
                ...gymData,
                slug,
                status: 'active'
            }])
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateGym(id: string, updates: Partial<GymUI>) {
        // Map UI keys to DB keys if needed
        const dbUpdates: any = { ...updates }
        if (updates.owner_id) dbUpdates.owner_user_id = updates.owner_id
        delete dbUpdates.id
        delete dbUpdates.owner_id

        const { data, error } = await supabase
            .from('gyms')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async deleteGym(id: string) {
        const { error } = await supabase
            .from('gyms')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    }
}
