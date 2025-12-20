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
        return (data || []).map(attendanceService.mapRecord)
    },

    async getMemberAttendance(userId: string): Promise<AttendanceUI[]> {
        const { data, error } = await supabase
            .from('attendance')
            .select(`
                *,
                user:users!user_id(display_name, trainer_details) 
            `)
            .eq('user_id', userId)
            .order('check_in_time', { ascending: false })

        if (error) throw error
        return (data || []).map(attendanceService.mapRecord)
    },

    mapRecord(record: any): AttendanceUI {
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
            member_name: record.user?.display_name || record.member_name || 'Unknown Member',
            check_in_time: checkIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            check_out_time: checkOut?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || null,
            duration: durationStr,
            type: record.type,
            status: record.status,
            method: record.method || 'Manual',
            trainer_name: record.trainer_name || null
        }
    },

    async checkIn(checkInData: any) {
        const dbRecord = {
            gym_id: checkInData.gym_id,
            user_id: checkInData.member_id,
            member_name: checkInData.member_name, // Store name in case user record doesn't exist/join fails
            type: 'gym_visit',
            check_in_time: new Date().toISOString(),
            status: 'present',
            method: checkInData.method || 'Manual',
            trainer_name: checkInData.trainer_name
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
