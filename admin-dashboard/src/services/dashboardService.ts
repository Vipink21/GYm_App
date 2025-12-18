import { supabase } from '../lib/supabase'

export interface DashboardStats {
    totalMembers: number
    activeTrainers: number
    monthlyRevenue: number
    checkInsToday: number
}

export const dashboardService = {
    async getStats(gymId: string): Promise<DashboardStats> {
        // Parallel queries
        const today = new Date().toISOString().split('T')[0]

        // 1. Total Members
        const { count: membersCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('gym_id', gymId)
            .eq('role', 'member')

        // 2. Active Trainers
        const { count: trainersCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('gym_id', gymId)
            .eq('role', 'trainer')
            .eq('status', 'active')

        // 3. Revenue (This Month) -- Need to sum payments
        // Supabase select with sum is tricky without function or fetching all.
        // For now, fetch all payments for this month.
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
        const { data: payments } = await supabase
            .from('payments')
            .select('amount')
            .eq('gym_id', gymId)
            .gte('transaction_date', startOfMonth)

        const revenue = (payments || []).reduce((acc, p) => acc + (Number(p.amount) || 0), 0)

        // 4. Check-ins Today
        const { count: checkInsCount } = await supabase
            .from('attendance')
            .select('*', { count: 'exact', head: true })
            .eq('gym_id', gymId)
            .gte('check_in_time', today) // Assuming simple date match works or logic needed for timezone check

        return {
            totalMembers: membersCount || 0,
            activeTrainers: trainersCount || 0,
            monthlyRevenue: revenue,
            checkInsToday: checkInsCount || 0
        }
    }
}
