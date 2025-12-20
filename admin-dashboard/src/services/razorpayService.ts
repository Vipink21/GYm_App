import { Plan } from './subscriptionService'
import { settingsService } from './settingsService'

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
}

declare global {
    interface Window {
        Razorpay: any
    }
}

export const razorpayService = {
    async fetchKey() {
        try {
            const dbKey = await settingsService.getRazorpayKey();
            if (dbKey) return dbKey;
        } catch (e) {
            console.warn('Failed to fetch Razorpay key from DB, falling back to env');
        }
        return import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder';
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
    }
}
