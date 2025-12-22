// Supabase Edge Function: Create Razorpay Order
// This function creates a valid Razorpay order using the Key Secret
// Deploy: supabase functions deploy create-razorpay-order

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RAZORPAY_KEY_ID = 'rzp_test_RtquCrCtXArTcZ'
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!

// CORS headers for frontend requests
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Parse request body
        const { amount, currency, receipt, notes } = await req.json()

        // Validate amount
        if (!amount || amount <= 0) {
            throw new Error('Invalid amount')
        }

        // Create Basic Auth header
        const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)

        // Call Razorpay API to create order
        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: Math.round(amount * 100), // Convert to paise (₹1 = 100 paise)
                currency: currency || 'INR',
                receipt: receipt || `receipt_${Date.now()}`,
                notes: notes || {},
                payment_capture: 1 // Auto-capture payment
            })
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error?.description || 'Failed to create order')
        }

        const order = await response.json()

        console.log('Order created successfully:', order.id)

        return new Response(
            JSON.stringify(order),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Error creating order:', error)

        return new Response(
            JSON.stringify({
                error: error.message || 'Internal server error',
                details: error.toString()
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
