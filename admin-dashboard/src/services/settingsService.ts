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
        // Use upsert to insert if not exists, update if exists
        const { error } = await supabase
            .from('system_settings')
            .upsert(
                {
                    key,
                    value,
                    updated_at: new Date().toISOString()
                },
                {
                    onConflict: 'key'  // Update if key already exists
                }
            );

        if (error) throw error;
    },

    async getRazorpayKey(): Promise<string | null> {
        console.log('getRazorpayKey: Querying database...');

        const { data, error } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'razorpay_key_id')
            .single();

        console.log('getRazorpayKey: Query result:', { data, error });

        if (error) {
            console.error('getRazorpayKey: Database error:', error);
            return null;
        }

        const value = data?.value || null;
        console.log('getRazorpayKey: Returning value:', value ? `${value.substring(0, 15)}...` : 'null');
        return value;
    }
}
