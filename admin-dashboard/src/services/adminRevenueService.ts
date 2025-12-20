import { supabase } from '../lib/supabase'

export interface PaymentTransaction {
    id: string;
    gym_id: string;
    amount: number;
    status: string;
    payment_method: string;
    created_at: string;
    paid_at: string;
    gym: {
        name: string;
    };
    plan: {
        name: string;
    };
}

export const adminRevenueService = {
    async getStats() {
        // Fetch total revenue from completed payments
        const { data: revenueData, error: revError } = await supabase
            .from('subscription_payments')
            .select('amount')
            .eq('status', 'completed');

        if (revError) throw revError;

        const totalRevenue = (revenueData || []).reduce((sum, p) => sum + Number(p.amount), 0);

        // Fetch active subscriptions count
        const { count, error: subError } = await supabase
            .from('gym_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');

        if (subError) throw subError;

        return {
            totalRevenue,
            activeSubscriptions: count || 0
        };
    },

    async getRevenueTrend() {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from('subscription_payments')
            .select('amount, created_at')
            .eq('status', 'completed')
            .gte('created_at', sixMonthsAgo.toISOString())
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Group by month
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const trendMap = new Map();

        // Initialize last 6 months
        for (let i = 0; i < 6; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthName = months[date.getMonth()];
            trendMap.set(monthName, 0);
        }

        (data || []).forEach(p => {
            const date = new Date(p.created_at);
            const monthName = months[date.getMonth()];
            if (trendMap.has(monthName)) {
                trendMap.set(monthName, trendMap.get(monthName) + Number(p.amount));
            }
        });

        // Convert to array in correct order (oldest to newest)
        const result = [];
        const currentMonth = new Date().getMonth();
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(currentMonth - i);
            const monthName = months[date.getMonth()];
            result.push({
                name: monthName,
                amount: trendMap.get(monthName)
            });
        }

        return result;
    },

    async getAllTransactions(): Promise<PaymentTransaction[]> {
        const { data, error } = await supabase
            .from('subscription_payments')
            .select(`
                *,
                gym:gyms(name),
                plan:saas_plans(name)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }
}
