import { supabase } from '../lib/supabase'

export interface AttendanceUI {
    id: string
    gym_id: string
    user_id: string | null
    member_name: string
    check_in_time: string
    check_out_time: string | null
    duration: string | null
    type: string
    status: string
    method: 'QR Code' | 'Manual' | 'Biometric' // Mapped from logic or stored
    trainer_name?: string | null
}

export const attendanceService = {
    async getAttendance(gymId: string): Promise<AttendanceUI[]> {
        const { data, error } = await supabase
            .from('attendance')
            .select(`
                *,
                user:users!user_id(display_name, trainer_details) 
            `)
            .eq('gym_id', gymId)
            .order('check_in_time', { ascending: false })

        if (error) throw error

        return (data || []).map((record: any) => {
            const checkIn = new Date(record.check_in_time)
            const checkOut = record.check_out_time ? new Date(record.check_out_time) : null

            // Calculate duration
            let durationStr = null
            if (checkOut) {
                const diffMs = checkOut.getTime() - checkIn.getTime()
                const hours = Math.floor(diffMs / (1000 * 60 * 60))
                const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
                durationStr = `${hours}h ${mins}m`
            }

            return {
                id: record.id,
                gym_id: record.gym_id,
                user_id: record.user_id,
                member_name: record.user?.display_name || 'Unknown Member', // Handle users without profile
                check_in_time: checkIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                check_out_time: checkOut?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || null,
                duration: durationStr,
                type: record.type,
                status: record.status,
                method: 'Manual', // Database doesn't have method column yet, default to Manual or infer
                trainer_name: null // Attendance table doesn't link trainer directly usually, unless for a class
            }
        })
    },

    async checkIn(checkInData: any) {
        // Find user by some ID or create a temp record? 
        // For manual check-in we likely pick a member from a dropdown

        const dbRecord = {
            gym_id: checkInData.gym_id,
            user_id: checkInData.member_id,
            type: 'gym_visit',
            check_in_time: new Date().toISOString(),
            status: 'present'
        }

        const { data, error } = await supabase
            .from('attendance')
            .insert([dbRecord])
            .select()
            .single()

        if (error) throw error
        return data
    },

    async checkOut(attendanceId: string) {
        const { data, error } = await supabase
            .from('attendance')
            .update({
                check_out_time: new Date().toISOString(),
                status: 'checked_out'
            })
            .eq('id', attendanceId)
            .select()
            .single()

        if (error) throw error
        return data
    }
}
