import { supabase } from '../lib/supabase';

// Matching the frontend simplified interface
export interface MemberUI {
    id: string;
    full_name: string;
    phone: string;
    email: string;
    plan: string;
    status: 'active' | 'expiring' | 'expired' | 'inactive';
    trainer_name: string;
    joined_date: string;
}

export const memberService = {
    // Fetch all members for a specific gym
    async getMembers(gymId: string): Promise<MemberUI[]> {
        try {
            const { data: members, error } = await supabase
                .from('members')
                .select('*')
                .eq('gym_id', gymId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform raw DB members to UI format
            return (members || []).map((m: any) => ({
                id: m.id,
                full_name: m.full_name,
                phone: m.phone || '',
                email: m.email || '',
                plan: m.member_plan || 'No Plan',
                status: m.status || 'active',
                trainer_name: m.trainer_name || 'Unassigned',
                // Use join_date if valid, else created_at
                joined_date: m.join_date
                    ? m.join_date
                    : new Date(m.created_at).toISOString().split('T')[0],
            }));
        } catch (error) {
            console.error('Error in getMembers:', error);
            throw error;
        }
    },

    async createMember(memberData: any) {
        // Map UI data to 'members' table schema
        const dbMember = {
            gym_id: memberData.gym_id,
            email: memberData.email,
            phone: memberData.phone,
            full_name: memberData.full_name,
            first_name: memberData.full_name.split(' ')[0],
            last_name: memberData.full_name.split(' ').slice(1).join(' '),
            status: memberData.status,
            member_plan: memberData.plan,
            trainer_name: memberData.trainer_name,
            join_date: new Date().toISOString().split('T')[0]
        };

        const { data, error } = await supabase
            .from('members')
            .insert([dbMember])
            .select()
            .single();

        if (error) {
            console.error('Supabase Error in createMember:', error)
            throw error;
        }
        return data;
    },

    async updateMember(id: string, updates: any) {
        const dbUpdates: any = {};
        if (updates.full_name) {
            dbUpdates.full_name = updates.full_name;
            dbUpdates.first_name = updates.full_name.split(' ')[0];
            dbUpdates.last_name = updates.full_name.split(' ').slice(1).join(' ');
        }
        if (updates.phone) dbUpdates.phone = updates.phone;
        if (updates.email) dbUpdates.email = updates.email;
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.plan) dbUpdates.member_plan = updates.plan;
        if (updates.trainer_name) dbUpdates.trainer_name = updates.trainer_name;

        const { data, error } = await supabase
            .from('members')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteMember(id: string) {
        const { error } = await supabase
            .from('members')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
