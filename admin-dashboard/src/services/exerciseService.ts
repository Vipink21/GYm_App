import { supabase } from '../lib/supabase'

export interface Exercise {
    id: string;
    name: string;
    muscle_group: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    equipment: string;
    description: string;
    video_url?: string;
    thumbnail_at?: string;
    is_global: boolean;
    gym_id?: string;
    created_at: string;
}

export const exerciseService = {
    async getAllExercises(): Promise<Exercise[]> {
        const { data, error } = await supabase
            .from('exercises')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async createExercise(exercise: Partial<Exercise>) {
        const { data, error } = await supabase
            .from('exercises')
            .insert({ ...exercise, is_global: true })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateExercise(id: string, updates: Partial<Exercise>) {
        const { data, error } = await supabase
            .from('exercises')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteExercise(id: string) {
        const { error } = await supabase
            .from('exercises')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}
