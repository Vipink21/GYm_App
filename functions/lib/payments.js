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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.razorpayWebhook = exports.createPaymentOrder = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const razorpay_1 = __importDefault(require("razorpay"));
const crypto = __importStar(require("crypto"));
const db = admin.firestore();
// Initialize Razorpay (use Firebase config in production)
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || 'your_key_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_key_secret',
});
/**
 * Create a Razorpay payment order
 */
exports.createPaymentOrder = functions.https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { planId, branchId } = data;
    const userId = context.auth.uid;
    // Fetch membership plan details
    const planDoc = await db.doc(`membershipPlans/${planId}`).get();
    if (!planDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Membership plan not found');
    }
    const plan = planDoc.data();
    const amount = plan.price * 100; // Convert to paise
    try {
        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount,
            currency: 'INR',
            receipt: `mem_${userId}_${Date.now()}`,
            notes: {
                userId,
                planId,
                branchId,
                purpose: 'membership',
            },
        });
        // Create pending payment record
        await db.collection('payments').add({
            userId,
            gymId: plan.gymId,
            branchId,
            amount: plan.price,
            currency: 'INR',
            method: 'razorpay',
            razorpay: { orderId: order.id },
            purpose: 'membership',
            referenceId: planId,
            description: `${plan.name} Membership`,
            subtotal: plan.price,
            totalAmount: plan.price,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        };
    }
    catch (error) {
        console.error('Error creating order:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create payment order');
    }
});
/**
 * Razorpay webhook handler
 */
exports.razorpayWebhook = functions.https.onRequest(async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret';
    // Verify signature
    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');
    if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        res.status(400).send('Invalid signature');
        return;
    }
    const event = req.body;
    try {
        switch (event.event) {
            case 'payment.captured':
                await handlePaymentCaptured(event.payload.payment.entity);
                break;
            case 'payment.failed':
                await handlePaymentFailed(event.payload.payment.entity);
                break;
            default:
                console.log('Unhandled event:', event.event);
        }
        res.status(200).send('OK');
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.status(500).send('Error processing webhook');
    }
});
async function handlePaymentCaptured(payment) {
    const { order_id, id: paymentId, amount } = payment;
    // Find pending payment record
    const paymentQuery = await db
        .collection('payments')
        .where('razorpay.orderId', '==', order_id)
        .limit(1)
        .get();
    if (paymentQuery.empty) {
        console.error('Payment record not found for order:', order_id);
        return;
    }
    const paymentDoc = paymentQuery.docs[0];
    const paymentData = paymentDoc.data();
    // Update payment status
    await paymentDoc.ref.update({
        status: 'success',
        'razorpay.paymentId': paymentId,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    // Activate membership if payment was for membership
    if (paymentData.purpose === 'membership') {
        const planDoc = await db.doc(`membershipPlans/${paymentData.referenceId}`).get();
        const plan = planDoc.data();
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.durationDays);
        await db.collection('memberships').add({
            userId: paymentData.userId,
            branchId: paymentData.branchId,
            gymId: paymentData.gymId,
            planId: paymentData.referenceId,
            planSnapshot: {
                name: plan.name,
                durationDays: plan.durationDays,
                price: plan.price,
                features: plan.features || [],
            },
            startDate,
            endDate,
            price: paymentData.amount,
            currency: paymentData.currency,
            finalPrice: paymentData.totalAmount,
            paymentId: paymentDoc.id,
            autoRenew: false,
            renewalRemindersSent: [],
            status: 'active',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: 'system',
        });
        // Send notification
        await sendNotification(paymentData.userId, {
            title: 'Payment Successful! 🎉',
            body: `Your payment of ₹${amount / 100} was successful. Membership activated!`,
            type: 'payment',
        });
    }
}
async function handlePaymentFailed(payment) {
    const { order_id, error_description } = payment;
    const paymentQuery = await db
        .collection('payments')
        .where('razorpay.orderId', '==', order_id)
        .limit(1)
        .get();
    if (!paymentQuery.empty) {
        await paymentQuery.docs[0].ref.update({
            status: 'failed',
            failureReason: error_description,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
}
async function sendNotification(userId, notification) {
    await db.collection('notifications').add(Object.assign(Object.assign({ userId }, notification), { read: false, createdAt: admin.firestore.FieldValue.serverTimestamp() }));
    // TODO: Send FCM push notification
}
//# sourceMappingURL=payments.js.map