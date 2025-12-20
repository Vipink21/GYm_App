import { supabase } from '../lib/supabase'

export interface ClassUI {
    id: string
    name: string
    description?: string
    trainer_name: string
    trainer_id?: string
    schedule_time: string // ISO string
    duration_min: number
    capacity: number
    enrolled: number
    status: 'scheduled' | 'cancelled' | 'completed'
}

export const classService = {
    async getClasses(gymId: string): Promise<ClassUI[]> {
        const { data: classes, error } = await supabase
            .from('classes')
            .select(`
                *,
                trainer:users!trainer_user_id(display_name)
            `)
            .eq('gym_id', gymId)
            .order('schedule_time', { ascending: true })

        if (error) throw error

        return (classes || []).map((cls: any) => ({
            id: cls.id,
            name: cls.name,
            description: cls.description,
            trainer_name: cls.trainer?.display_name || 'Unassigned',
            trainer_id: cls.trainer_user_id,
            schedule_time: cls.schedule_time,
            duration_min: cls.duration_min,
            capacity: cls.capacity,
            enrolled: cls.enrolled_count || 0,
            status: cls.status
        }))
    },

    async createClass(classData: any) {
        const dbClass = {
            gym_id: classData.gym_id,
            name: classData.name,
            description: classData.description,
            trainer_user_id: classData.trainer_id,
            schedule_time: classData.schedule_time,
            duration_min: classData.duration_min,
            capacity: classData.capacity,
            status: 'scheduled'
        }

        const { data, error } = await supabase
            .from('classes')
            .insert([dbClass])
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateClass(id: string, updates: any) {
        const dbUpdates: any = {}
        if (updates.name) dbUpdates.name = updates.name
        if (updates.description) dbUpdates.description = updates.description
        if (updates.trainer_id) dbUpdates.trainer_user_id = updates.trainer_id
        if (updates.schedule_time) dbUpdates.schedule_time = updates.schedule_time
        if (updates.duration_min) dbUpdates.duration_min = updates.duration_min
        if (updates.capacity) dbUpdates.capacity = updates.capacity
        if (updates.status) dbUpdates.status = updates.status

        const { data, error } = await supabase
            .from('classes')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async deleteClass(id: string) {
        const { error } = await supabase
            .from('classes')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    },

    async bookClass(id: string) {
        // Fetch current enrolled count
        const { data: cls, error: fetchError } = await supabase
            .from('classes')
            .select('enrolled_count, capacity')
            .eq('id', id)
            .single()

        if (fetchError) throw fetchError
        if (cls.enrolled_count >= cls.capacity) throw new Error('Class is full')

        const { data, error } = await supabase
            .from('classes')
            .update({ enrolled_count: (cls.enrolled_count || 0) + 1 })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }
}
