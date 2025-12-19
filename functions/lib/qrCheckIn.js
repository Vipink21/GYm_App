"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQRCheckIn = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const date_fns_1 = require("date-fns");
const db = admin.firestore();
/**
 * Validate QR code check-in
 * Called by gym staff when scanning a member's QR code
 */
exports.validateQRCheckIn = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    // Verify caller is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { qrData, branchId } = data;
    // Decode QR data (QR contains encrypted userId)
    const userId = decodeQRData(qrData);
    if (!userId) {
        return { success: false, error: 'INVALID_QR_CODE' };
    }
    // Fetch user
    const userDoc = await db.doc(`users/${userId}`).get();
    if (!userDoc.exists) {
        return { success: false, error: 'USER_NOT_FOUND' };
    }
    const user = userDoc.data();
    // Check for active membership
    const today = new Date();
    const membershipQuery = await db
        .collection('memberships')
        .where('userId', '==', userId)
        .where('status', '==', 'active')
        .where('endDate', '>=', today)
        .limit(1)
        .get();
    if (membershipQuery.empty) {
        return {
            success: false,
            error: 'NO_ACTIVE_MEMBERSHIP',
            user: {
                firstName: (_a = user.profile) === null || _a === void 0 ? void 0 : _a.firstName,
                lastName: (_b = user.profile) === null || _b === void 0 ? void 0 : _b.lastName,
                photoUrl: (_c = user.profile) === null || _c === void 0 ? void 0 : _c.photoUrl,
            },
        };
    }
    const membership = membershipQuery.docs[0].data();
    // Check for existing check-in today
    const dateStr = (0, date_fns_1.format)(today, 'yyyy-MM-dd');
    const existingCheckIn = await db
        .collection('attendance')
        .where('userId', '==', userId)
        .where('branchId', '==', branchId)
        .where('date', '==', dateStr)
        .limit(1)
        .get();
    if (!existingCheckIn.empty) {
        const checkIn = existingCheckIn.docs[0].data();
        return {
            success: true,
            alreadyCheckedIn: true,
            checkInTime: checkIn.checkInTime.toDate(),
            user: {
                firstName: (_d = user.profile) === null || _d === void 0 ? void 0 : _d.firstName,
                lastName: (_e = user.profile) === null || _e === void 0 ? void 0 : _e.lastName,
                photoUrl: (_f = user.profile) === null || _f === void 0 ? void 0 : _f.photoUrl,
            },
        };
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
    });
    // Update user stats
    await db.doc(`users/${userId}`).update({
        'stats.lastCheckIn': admin.firestore.FieldValue.serverTimestamp(),
        'stats.totalWorkouts': admin.firestore.FieldValue.increment(1),
    });
    // Send welcome notification
    await db.collection('notifications').add({
        userId,
        title: 'Check-In Successful! ✓',
        body: 'Have a great workout!',
        type: 'general',
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return {
        success: true,
        alreadyCheckedIn: false,
        attendanceId: attendanceRef.id,
        user: {
            firstName: (_g = user.profile) === null || _g === void 0 ? void 0 : _g.firstName,
            lastName: (_h = user.profile) === null || _h === void 0 ? void 0 : _h.lastName,
            photoUrl: (_j = user.profile) === null || _j === void 0 ? void 0 : _j.photoUrl,
        },
        membership: {
            planName: (_k = membership.planSnapshot) === null || _k === void 0 ? void 0 : _k.name,
            endDate: membership.endDate.toDate(),
        },
    };
});
function decodeQRData(qrData) {
    try {
        // QR data format: "GYM:{userId}:{timestamp}:{signature}"
        // In production, verify signature with secret key
        const parts = qrData.split(':');
        if (parts.length >= 2 && parts[0] === 'GYM') {
            return parts[1];
        }
        return null;
    }
    catch (_a) {
        return null;
    }
}
//# sourceMappingURL=qrCheckIn.js.map