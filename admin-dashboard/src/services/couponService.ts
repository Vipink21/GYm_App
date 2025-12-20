import { supabase } from '../lib/supabase'

export interface Coupon {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    max_uses?: number;
    current_uses: number;
    expiry_date?: string;
    is_active: boolean;
    created_at: string;
}

export const couponService = {
    async getCoupons(): Promise<Coupon[]> {
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async createCoupon(data: Partial<Coupon>) {
        const { data: coupon, error } = await supabase
            .from('coupons')
            .insert({
                ...data,
                current_uses: 0,
                is_active: true
            })
            .select()
            .single();

        if (error) throw error;
        return coupon;
    },

    async toggleCoupon(id: string, is_active: boolean) {
        const { error } = await supabase
            .from('coupons')
            .update({ is_active })
            .eq('id', id);

        if (error) throw error;
    },

    async deleteCoupon(id: string) {
        const { error } = await supabase
            .from('coupons')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}
