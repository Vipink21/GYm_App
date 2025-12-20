import { supabase } from '../lib/supabase'

export interface SystemSetting {
    key: string;
    value: string;
    description?: string;
}

export const settingsService = {
    async getSettings(): Promise<SystemSetting[]> {
        const { data, error } = await supabase
            .from('system_settings')
            .select('*');

        if (error) throw error;
        return data || [];
    },

    async updateSetting(key: string, value: string): Promise<void> {
        const { error } = await supabase
            .from('system_settings')
            .update({ value, updated_at: new Date().toISOString() })
            .eq('key', key);

        if (error) throw error;
    },

    async getRazorpayKey(): Promise<string | null> {
        const { data, error } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'razorpay_key_id')
            .single();

        if (error) return null;
        return data?.value || null;
    }
}
