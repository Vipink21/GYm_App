import { supabase } from '../lib/supabase'

export interface SupportTicket {
    id: string;
    gym_id: string;
    user_id: string;
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    category: 'billing' | 'technical' | 'feature_request' | 'other';
    created_at: string;
    updated_at: string;
    gym?: {
        name: string;
    };
    user?: {
        display_name: string;
        email: string;
    }
}

export const supportService = {
    async getTickets(): Promise<SupportTicket[]> {
        const { data, error } = await supabase
            .from('support_tickets')
            .select(`
                *,
                gym:gyms(name),
                user:users!user_id(display_name, email)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async updateTicketStatus(id: string, status: SupportTicket['status']) {
        const { error } = await supabase
            .from('support_tickets')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    },

    async replyToTicket(id: string, message: string) {
        // In a real app, this would insert into a 'ticket_communications' table
        // For now, we'll mark it as in_progress and let the audit log handle the message content
        console.log(`Reply to ticket ${id}: ${message}`);

        const { error } = await supabase
            .from('support_tickets')
            .update({
                status: 'in_progress',
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;
    }
}
