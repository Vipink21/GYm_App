import { supabase } from '../lib/supabase'

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    is_read: boolean;
    link?: string;
    created_at: string;
}

export const notificationService = {
    async getNotifications(isSuperAdmin: boolean): Promise<AppNotification[]> {
        let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });

        if (isSuperAdmin) {
            query = query.eq('target_role', 'superadmin');
        } else {
            // Regular user gets their own
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                query = query.eq('user_id', user.id);
            }
        }

        const { data, error } = await query.limit(50);
        if (error) throw error;
        return data || [];
    },

    async markAsRead(id: string) {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);
        if (error) throw error;
    },

    async markAllAsRead(isSuperAdmin: boolean) {
        let query = supabase.from('notifications').update({ is_read: true });

        if (isSuperAdmin) {
            query = query.eq('target_role', 'superadmin');
        } else {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) query = query.eq('user_id', user.id);
        }

        const { error } = await query;
        if (error) throw error;
    },

    async sendBroadcast(data: { title: string, message: string, type: string, target_role: string }) {
        const { error } = await supabase
            .from('notifications')
            .insert({
                title: data.title,
                message: data.message,
                type: data.type,
                target_role: data.target_role,
                is_read: false
            });

        if (error) throw error;
    }
}
