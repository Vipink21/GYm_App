import { supabase } from '../lib/supabase'

export interface TransactionUI {
    id: string
    gym_id: string
    member_name: string
    type: string
    plan: string
    amount: number
    method: string
    status: 'success' | 'pending' | 'failed'
    date: string
    time: string
}

export const paymentService = {
    async getTransactions(gymId: string): Promise<TransactionUI[]> {
        const { data, error } = await supabase
            .from('payments')
            .select(`
                *,
                user:users!user_id(display_name)
            `)
            .eq('gym_id', gymId)
            .order('transaction_date', { ascending: false })

        if (error) throw error

        return (data || []).map((txn: any) => {
            const dateObj = new Date(txn.transaction_date)
            return {
                id: txn.id, // Or format as 'TXN...' if needed
                gym_id: txn.gym_id,
                member_name: txn.user?.display_name || 'Guest',
                type: 'membership', // needs a column in DB or logic
                plan: txn.description || 'General Payment',
                amount: Number(txn.amount),
                method: txn.payment_method || 'cash',
                status: txn.status as any,
                date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            }
        })
    },

    async createTransaction(paymentData: any) {
        const dbRecord = {
            gym_id: paymentData.gym_id,
            user_id: paymentData.user_id,
            amount: paymentData.amount,
            currency: 'INR', // Default
            status: paymentData.status || 'completed',
            payment_method: paymentData.method,
            description: paymentData.plan, // Storing plan name in description for now
            transaction_date: new Date().toISOString()
        }

        const { data, error } = await supabase
            .from('payments')
            .insert([dbRecord])
            .select()
            .single()

        if (error) throw error
        return data
    }
}
