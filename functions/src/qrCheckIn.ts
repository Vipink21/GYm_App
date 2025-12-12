import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { format } from 'date-fns'

const db = admin.firestore()

/**
 * Validate QR code check-in
 * Called by gym staff when scanning a member's QR code
 */
export const validateQRCheckIn = functions.https.onCall(async (data, context) => {
    // Verify caller is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const { qrData, branchId } = data

    // Decode QR data (QR contains encrypted userId)
    const userId = decodeQRData(qrData)
    if (!userId) {
        return { success: false, error: 'INVALID_QR_CODE' }
    }

    // Fetch user
    const userDoc = await db.doc(`users/${userId}`).get()
    if (!userDoc.exists) {
        return { success: false, error: 'USER_NOT_FOUND' }
    }

    const user = userDoc.data()!

    // Check for active membership
    const today = new Date()
    const membershipQuery = await db
        .collection('memberships')
        .where('userId', '==', userId)
        .where('status', '==', 'active')
        .where('endDate', '>=', today)
        .limit(1)
        .get()

    if (membershipQuery.empty) {
        return {
            success: false,
            error: 'NO_ACTIVE_MEMBERSHIP',
            user: {
                firstName: user.profile?.firstName,
                lastName: user.profile?.lastName,
                photoUrl: user.profile?.photoUrl,
            },
        }
    }

    const membership = membershipQuery.docs[0].data()

    // Check for existing check-in today
    const dateStr = format(today, 'yyyy-MM-dd')
    const existingCheckIn = await db
        .collection('attendance')
        .where('userId', '==', userId)
        .where('branchId', '==', branchId)
        .where('date', '==', dateStr)
        .limit(1)
        .get()

    if (!existingCheckIn.empty) {
        const checkIn = existingCheckIn.docs[0].data()
        return {
            success: true,
            alreadyCheckedIn: true,
            checkInTime: checkIn.checkInTime.toDate(),
            user: {
                firstName: user.profile?.firstName,
                lastName: user.profile?.lastName,
                photoUrl: user.profile?.photoUrl,
            },
        }
    }

    // Create new attendance record
    const attendanceRef = await db.collection('attendance').add({
        userId,
        gymId: user.gymId,
        branchId,
        date: dateStr,
        checkInTime: admin.firestore.FieldValue.serverTimestamp(),
        method: 'qr_code',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    // Update user stats
    await db.doc(`users/${userId}`).update({
        'stats.lastCheckIn': admin.firestore.FieldValue.serverTimestamp(),
        'stats.totalWorkouts': admin.firestore.FieldValue.increment(1),
    })

    // Send welcome notification
    await db.collection('notifications').add({
        userId,
        title: 'Check-In Successful! ✓',
        body: 'Have a great workout!',
        type: 'general',
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    return {
        success: true,
        alreadyCheckedIn: false,
        attendanceId: attendanceRef.id,
        user: {
            firstName: user.profile?.firstName,
            lastName: user.profile?.lastName,
            photoUrl: user.profile?.photoUrl,
        },
        membership: {
            planName: membership.planSnapshot?.name,
            endDate: membership.endDate.toDate(),
        },
    }
})

function decodeQRData(qrData: string): string | null {
    try {
        // QR data format: "GYM:{userId}:{timestamp}:{signature}"
        // In production, verify signature with secret key
        const parts = qrData.split(':')
        if (parts.length >= 2 && parts[0] === 'GYM') {
            return parts[1]
        }
        return null
    } catch {
        return null
    }
}
