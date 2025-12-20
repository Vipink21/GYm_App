import { supabase } from '../lib/supabase'

export interface GymDetails {
    id: string
    name: string
    location: string
    city: string
    type: string
    contact_no: string
    status: string
    created_at: string
    owner: {
        display_name: string
        email: string
        phone: string
        city: string
        address: string
    }
    subscription: {
        status: string
        plan: {
            name: string
        }
    }[]
}

export const adminService = {
    // Get all gyms with owner and plan details
    async getAllGyms(): Promise<GymDetails[]> {
        const { data, error } = await supabase
            .from('gyms')
            .select(`
                *,
                owner:users!owner_user_id (
                    display_name,
                    email,
                    phone,
                    city,
                    address
                ),
                gym_subscriptions (
                    id,
                    status,
                    plan_id,
                    saas_plans (
                        id,
                        name
                    )
                )
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('❌ Error fetching gyms:', error)
            console.error('Error details:', JSON.stringify(error, null, 2))
            return []
        }

        console.log('📊 Raw gym data from database:', JSON.stringify(data, null, 2))

        // Transform and filter subscriptions
        const gymsWithActiveSubs = (data || []).map((gym: any) => {
            // Handle gym_subscriptions being either an object or array
            let allSubs = gym.gym_subscriptions

            // Convert to array if it's a single object
            if (allSubs && !Array.isArray(allSubs)) {
                allSubs = [allSubs]
            } else if (!allSubs) {
                allSubs = []
            }

            const activeSubs = allSubs.filter((sub: any) => sub.status === 'active')

            console.log(`\n🏢 Gym: ${gym.name}`)
            console.log(`   Gym ID: ${gym.id}`)
            console.log(`   Total subscriptions: ${allSubs.length}`)
            console.log(`   Active subscriptions: ${activeSubs.length}`)

            if (allSubs.length > 0) {
                console.log(`   All subscription data:`, JSON.stringify(allSubs, null, 2))
            }

            // Transform to match expected structure
            const transformedSubs = activeSubs.map((sub: any) => ({
                status: sub.status,
                plan: sub.saas_plans ? {
                    id: sub.saas_plans.id,
                    name: sub.saas_plans.name
                } : null
            }))

            if (transformedSubs.length > 0 && transformedSubs[0].plan) {
                console.log(`   ✅ Active Plan: ${transformedSubs[0].plan.name}`)
                console.log(`   Plan ID: ${transformedSubs[0].plan.id}`)
            } else {
                console.log(`   ⚠️ No active subscriptions with valid plans found`)
            }

            return {
                ...gym,
                subscription: transformedSubs
            }
        })

        console.log('\n✅ Final processed gyms:', JSON.stringify(gymsWithActiveSubs.map(g => ({
            name: g.name,
            subscription_count: g.subscription?.length || 0,
            plan_name: g.subscription?.[0]?.plan?.name || 'None'
        })), null, 2))

        return gymsWithActiveSubs
    },

    // Delete a gym (Cascade DELETE will handle sub-data if configured, else manual)
    async deleteGym(gymId: string): Promise<void> {
        const { error } = await supabase
            .from('gyms')
            .delete()
            .eq('id', gymId)

        if (error) throw error
    },

    // Get total count of all end users (members) across the platform
    async getTotalUserCount(): Promise<number> {
        const { count, error } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'member')

        if (error) {
            console.error('Error counting users:', error)
            throw error
        }

        return count || 0
    },

    // Get platform-wide activity trend (attendance) for the last 7 days
    async getPlatformActivityTrend() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from('attendance')
            .select('check_in_time')
            .gte('check_in_time', sevenDaysAgo.toISOString())
            .order('check_in_time', { ascending: true });

        if (error) throw error;

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const activityMap = new Map();

        // Initialize last 7 days
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            activityMap.set(days[date.getDay()], 0);
        }

        (data || []).forEach(record => {
            const date = new Date(record.check_in_time);
            const dayName = days[date.getDay()];
            if (activityMap.has(dayName)) {
                activityMap.set(dayName, activityMap.get(dayName) + 1);
            }
        });

        // Convert to array in correct order (Mon-Sun or oldest to newest)
        const result = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayName = days[date.getDay()];
            result.push({
                name: dayName,
                users: activityMap.get(dayName)
            });
        }

        return result;
    }
}
