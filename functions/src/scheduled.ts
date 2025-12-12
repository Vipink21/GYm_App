import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { addDays, addHours, format } from 'date-fns'

const db = admin.firestore()

/**
 * Daily membership expiry check - runs at 9 AM IST
 * Sends reminders for memberships expiring in 7, 3, or 1 days
 */
export const scheduledMembershipExpiryCheck = functions.pubsub
    .schedule('0 9 * * *')
    .timeZone('Asia/Kolkata')
    .onRun(async (context) => {
        const today = new Date()
        const remindDays = [7, 3, 1]

        for (const days of remindDays) {
            const targetDate = addDays(today, days)
            const targetDateStr = format(targetDate, 'yyyy-MM-dd')

            // Query memberships expiring on target date
            const expiringQuery = await db
                .collection('memberships')
                .where('status', '==', 'active')
                .get()

            for (const doc of expiringQuery.docs) {
                const membership = doc.data()
                const endDate = membership.endDate.toDate()
                const endDateStr = format(endDate, 'yyyy-MM-dd')

                if (endDateStr !== targetDateStr) continue
                if (membership.renewalRemindersSent?.includes(days)) continue

                // Send notification
                await db.collection('notifications').add({
                    userId: membership.userId,
                    title: 'Membership Expiring Soon',
                    body: `Your membership expires in ${days} day${days > 1 ? 's' : ''}. Renew now to continue your fitness journey!`,
                    type: 'membership',
                    read: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                })

                // Update reminder sent
                await doc.ref.update({
                    renewalRemindersSent: admin.firestore.FieldValue.arrayUnion(days),
                })

                console.log(`Sent ${days}-day reminder to user ${membership.userId}`)
            }
        }

        return null
    })

/**
 * Hourly class reminder - sends notification 1 hour before class
 */
export const scheduledClassReminder = functions.pubsub
    .schedule('0 * * * *')
    .timeZone('Asia/Kolkata')
    .onRun(async (context) => {
        const now = new Date()
        const oneHourLater = addHours(now, 1)

        // Find classes starting in ~1 hour
        const classesQuery = await db
            .collection('classes')
            .where('status', '==', 'scheduled')
            .where('dateTime', '>=', now)
            .where('dateTime', '<=', oneHourLater)
            .get()

        for (const classDoc of classesQuery.docs) {
            const classData = classDoc.data()

            // Get confirmed bookings that haven't received reminder
            const bookingsQuery = await db
                .collection('classBookings')
                .where('classId', '==', classDoc.id)
                .where('status', '==', 'confirmed')
                .where('reminderSent', '==', false)
                .get()

            for (const bookingDoc of bookingsQuery.docs) {
                const booking = bookingDoc.data()

                // Send reminder notification
                await db.collection('notifications').add({
                    userId: booking.userId,
                    title: 'Class Starting Soon! 🏃',
                    body: `${classData.name} starts in 1 hour. Get ready!`,
                    type: 'class',
                    read: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                })

                // Mark reminder as sent
                await bookingDoc.ref.update({ reminderSent: true })
            }

            console.log(`Sent reminders for class ${classData.name}`)
        }

        return null
    })

/**
 * Daily expired membership cleanup - marks expired memberships
 */
export const scheduledMembershipStatusUpdate = functions.pubsub
    .schedule('0 0 * * *')
    .timeZone('Asia/Kolkata')
    .onRun(async (context) => {
        const today = new Date()

        const expiredQuery = await db
            .collection('memberships')
            .where('status', '==', 'active')
            .where('endDate', '<', today)
            .get()

        const batch = db.batch()
        let count = 0

        for (const doc of expiredQuery.docs) {
            batch.update(doc.ref, {
                status: 'expired',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            })
            count++
        }

        if (count > 0) {
            await batch.commit()
            console.log(`Marked ${count} memberships as expired`)
        }

        return null
    })
