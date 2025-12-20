import { Plan } from './subscriptionService'
import { settingsService } from './settingsService'
import { supabase } from '../lib/supabase'

interface RazorpayResponse {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
}

interface RazorpayOptions {
    key: string
    amount: number
    currency: string
    name: string
    description: string
    image?: string
    order_id: string
    handler: (response: RazorpayResponse) => void
    prefill: {
        name: string
        email: string
        contact: string
    }
    notes: Record<string, string>
    theme: {
        color: string
    }
    modal?: {
        ondismiss: () => void
    }
}

export interface MembershipPaymentData {
    gymId: string
    memberId?: string
    memberName: string
    memberEmail: string
    memberPhone: string
    planName: string
    planPrice: number
}

declare global {
    interface Window {
        Razorpay: any
    }
}

export const razorpayService = {
    async fetchKey() {
        console.log('Fetching Razorpay key...');
        try {
            const dbKey = await settingsService.getRazorpayKey();
            console.log('Database key result:', dbKey ? `${dbKey.substring(0, 15)}...` : 'null');

            if (dbKey) {
                console.log('Using database key');
                return dbKey;
            }
        } catch (e) {
            console.error('Failed to fetch Razorpay key from DB:', e);
        }

        const envKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder';
        console.log('Falling back to env key:', envKey.substring(0, 15) + '...');
        return envKey;
    },

    async createOrder(plan: Plan, billingCycle: 'monthly' | 'yearly') {
        // In a production app, this would be a call to your backend
        // Your backend would use the Razorpay Node.js SDK to create an order
        const amount = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly

        // Simulating backend response
        return {
            id: `order_${Math.random().toString(36).substring(7)}`,
            amount: (amount || 0) * 100, // Razorpay works in paise
            currency: 'INR'
        }
    },

    async createMembershipOrder(amount: number) {
        // Create order for member registration
        return {
            id: `order_${Math.random().toString(36).substring(7)}`,
            amount: amount * 100, // Razorpay works in paise
            currency: 'INR'
        }
    },

    async openCheckout(
        order: { id: string, amount: number, currency: string },
        plan: Plan,
        userData: { name: string, email: string, phone: string },
        onSuccess: (response: RazorpayResponse) => void
    ) {
        const key = await this.fetchKey();

        const options: RazorpayOptions = {
            key,
            amount: order.amount,
            currency: order.currency,
            name: 'FitZone Gym Management',
            description: `Upgrade to ${plan.name} Plan`,
            image: 'https://fitzone-admin.vercel.app/logo.png', // Update with real logo
            order_id: order.id,
            handler: onSuccess,
            prefill: {
                name: userData.name,
                email: userData.email,
                contact: userData.phone
            },
            notes: {
                plan_id: plan.id,
                gym_name: userData.name
            },
            theme: {
                color: '#8b5cf6' // Modern violet color
            }
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
    },

    /**
     * Open Razorpay checkout for member registration
     */
    async openMembershipCheckout(
        paymentData: MembershipPaymentData,
        onSuccess: (response: RazorpayResponse) => void,
        onFailure: (error: any) => void
    ) {
        try {
            // Check if Razorpay script is loaded
            if (!window.Razorpay) {
                throw new Error('Razorpay SDK not loaded. Please refresh the page and try again.');
            }

            const key = await this.fetchKey();

            // Validate key exists
            if (!key || key.trim() === '') {
                throw new Error('Razorpay key not configured. Please contact administrator.');
            }

            console.log('Razorpay key loaded:', key.substring(0, 15) + '...');

            const order = await this.createMembershipOrder(paymentData.planPrice);

            const options: RazorpayOptions = {
                key,
                amount: order.amount,
                currency: order.currency,
                name: 'Gym Membership Registration',
                description: `${paymentData.planName} Membership`,
                order_id: order.id,
                handler: async (response: RazorpayResponse) => {
                    // Just pass the response to the caller
                    // The caller will handle payment recording
                    onSuccess(response);
                },
                prefill: {
                    name: paymentData.memberName,
                    email: paymentData.memberEmail,
                    contact: paymentData.memberPhone
                },
                notes: {
                    gym_id: paymentData.gymId,
                    member_id: paymentData.memberId || '',
                    plan_name: paymentData.planName,
                    member_name: paymentData.memberName
                },
                theme: {
                    color: '#8b5cf6'
                },
                modal: {
                    ondismiss: () => {
                        onFailure(new Error('Payment cancelled by user'))
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error: any) {
            console.error('Razorpay checkout error:', error);
            onFailure(error);
        }
    },

    /**
     * Record membership payment in database
     */
    async recordMembershipPayment(paymentData: {
        gymId: string
        memberId?: string
        amount: number
        razorpayOrderId: string
        razorpayPaymentId: string
        razorpaySignature: string
        planName: string
        memberName: string
    }) {
        try {
            const { data, error } = await supabase
                .from('payments')
                .insert([{
                    gym_id: paymentData.gymId,
                    member_id: paymentData.memberId,
                    amount: paymentData.amount,
                    currency: 'INR',
                    payment_method: 'razorpay',
                    razorpay_order_id: paymentData.razorpayOrderId,
                    razorpay_payment_id: paymentData.razorpayPaymentId,
                    razorpay_signature: paymentData.razorpaySignature,
                    status: 'success',
                    description: `${paymentData.planName} - ${paymentData.memberName}`,
                    transaction_date: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error recording payment:', error);
            throw error;
        }
    },

    /**
     * Get membership plan price from database
     */
    async getMembershipPlanPrice(planName: string, gymId: string): Promise<number> {
        try {
            // Try to get from membership_plans table
            const { data: planData, error: planError } = await supabase
                .from('membership_plans')
                .select('price')
                .eq('gym_id', gymId)
                .eq('name', planName)
                .eq('is_active', true)
                .single();

            if (!planError && planData) {
                return planData.price;
            }

            // Fallback to default prices based on plan name
            const defaultPrices: { [key: string]: number } = {
                'Gold Annual': 12000,
                'Silver Monthly': 1500,
                'Platinum': 20000,
                'Bronze': 8000,
                'Basic': 5000,
                'Premium': 15000,
                'Standard': 3000
            };

            return defaultPrices[planName] || 1000;
        } catch (error) {
            console.error('Error getting plan price:', error);
            return 1000; // Default fallback
        }
    },

    /**
     * Check if plan is free tier
     */
    isFreeTier(planName: string): boolean {
        const freePlans = ['free', 'trial', 'demo', 'basic trial', 'no plan'];
        return freePlans.some(free => planName.toLowerCase().includes(free.toLowerCase()));
    }
}
