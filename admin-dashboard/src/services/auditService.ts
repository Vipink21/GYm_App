import { supabase } from '../lib/supabase'

export interface AuditLog {
    id: string;
    admin_id: string;
    action: string;
    entity: string;
    entity_id?: string;
    details: any;
    ip_address?: string;
    created_at: string;
    admin?: {
        display_name: string;
        email: string;
    }
}

export const auditService = {
    async logAction(action: string, entity: string, entity_id?: string, details?: any) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('audit_logs')
            .insert({
                admin_id: user.id,
                action,
                entity,
                entity_id,
                details: details || {},
                created_at: new Date().toISOString()
            });

        if (error) console.error('Failed to log audit action:', error);
    },

    async getLogs(): Promise<AuditLog[]> {
        const { data, error } = await supabase
            .from('audit_logs')
            .select(`
                *,
                admin:users!admin_id(display_name, email)
            `)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;
        return data || [];
    }
}
