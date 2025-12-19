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
exports.onClassBookingCreated = exports.onMembershipUpdated = exports.onDietPlanCreated = exports.onWorkoutPlanCreated = exports.onUserCreated = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
/**
 * Trigger: When a new user is created in Firebase Auth
 */
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
    // Create user document with basic info
    await db.doc(`users/${user.uid}`).set({
        id: user.uid,
        profile: {
            phone: user.phoneNumber || null,
            email: user.email || null,
            displayName: user.displayName || '',
            firstName: '',
            lastName: '',
        },
        role: 'member',
        status: 'active',
        onboardingCompleted: false,
        preferences: {
            language: 'en',
            notifications: {
                push: true,
                email: true,
                sms: true,
                workoutReminders: true,
                classReminders: true,
                membershipAlerts: true,
                promotions: false,
            },
            privacy: {
                showProgress: true,
                showInLeaderboard: true,
            },
        },
        stats: {
            totalWorkouts: 0,
            totalClasses: 0,
            currentStreak: 0,
            longestStreak: 0,
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`Created user document for ${user.uid}`);
});
/**
 * Trigger: When a workout plan is assigned
 */
exports.onWorkoutPlanCreated = functions.firestore
    .document('workoutPlans/{planId}')
    .onCreate(async (snap, context) => {
    const plan = snap.data();
    await db.collection('notifications').add({
        userId: plan.userId,
        title: 'New Workout Plan! 💪',
        body: `"${plan.name}" has been assigned to you. Let's get started!`,
        type: 'workout',
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`Notified user ${plan.userId} about new workout plan`);
});
/**
 * Trigger: When a diet plan is assigned
 */
exports.onDietPlanCreated = functions.firestore
    .document('dietPlans/{planId}')
    .onCreate(async (snap, context) => {
    const plan = snap.data();
    await db.collection('notifications').add({
        userId: plan.userId,
        title: 'New Diet Plan! 🥗',
        body: `"${plan.name}" has been assigned to you. Fuel your fitness!`,
        type: 'diet',
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
});
/**
 * Trigger: When membership status changes
 */
exports.onMembershipUpdated = functions.firestore
    .document('memberships/{membershipId}')
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    // Membership activated
    if (before.status !== 'active' && after.status === 'active') {
        await db.collection('notifications').add({
            userId: after.userId,
            title: 'Membership Activated! 🎉',
            body: 'Your membership is now active. Time to crush your goals!',
            type: 'membership',
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    // Membership expired
    if (before.status === 'active' && after.status === 'expired') {
        await db.collection('notifications').add({
            userId: after.userId,
            title: 'Membership Expired',
            body: 'Your membership has expired. Renew now to continue your fitness journey!',
            type: 'membership',
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
});
/**
 * Trigger: When a class booking is confirmed
 */
exports.onClassBookingCreated = functions.firestore
    .document('classBookings/{bookingId}')
    .onCreate(async (snap, context) => {
    var _a;
    const booking = snap.data();
    if (booking.status === 'confirmed') {
        await db.collection('notifications').add({
            userId: booking.userId,
            title: 'Class Booked! ✓',
            body: `You're booked for ${(_a = booking.classSnapshot) === null || _a === void 0 ? void 0 : _a.name}. See you there!`,
            type: 'class',
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Update class booked count
        const classRef = db.doc(`classes/${booking.classId}`);
        await classRef.update({
            bookedCount: admin.firestore.FieldValue.increment(1),
        });
    }
});
//# sourceMappingURL=triggers.js.map