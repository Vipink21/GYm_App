import { supabase } from '../lib/supabase'

export interface Plan {
    id: string
    name: string
    description: string
    price_monthly: number
    price_yearly: number
    max_gyms: number
    max_members_per_gym: number | null
    max_trainers_per_gym: number | null
    features: string[]
    is_active: boolean
}

export interface PlanChangeHistory {
    id: string
    plan_id: string
    field_name: string
    old_value: string
    new_value: string
    change_reason: string | null
    created_at: string
}

export const planManagementService = {
    // Get all plans (for admin)
    async getAllPlans(): Promise<Plan[]> {
        const { data, error } = await supabase
            .from('saas_plans')
            .select('*')
            .order('price_monthly')

        if (error) throw error
        return data || []
    },

    // Update plan pricing
    async updatePlan(planId: string, updates: Partial<Plan>): Promise<void> {
        const { error } = await supabase
            .from('saas_plans')
            .update(updates)
            .eq('id', planId)

        if (error) throw error
    },

    // Create new plan
    async createPlan(planData: Omit<Plan, 'id'>): Promise<Plan> {
        const { data, error } = await supabase
            .from('saas_plans')
            .insert([planData])
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Delete plan
    async deletePlan(planId: string): Promise<void> {
        const { error } = await supabase
            .from('saas_plans')
            .delete()
            .eq('id', planId)

        if (error) throw error
    },

    // Get change history for a plan
    async getPlanHistory(planId: string): Promise<PlanChangeHistory[]> {
        const { data, error } = await supabase
            .from('plan_change_history')
            .select('*')
            .eq('plan_id', planId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    // Toggle plan active status
    async togglePlanStatus(planId: string, isActive: boolean): Promise<void> {
        const { error } = await supabase
            .from('saas_plans')
            .update({ is_active: isActive })
            .eq('id', planId)

        if (error) throw error
    }
}
