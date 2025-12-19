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
exports.aiTrainerChat = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const openai_1 = __importDefault(require("openai"));
const db = admin.firestore();
// Initialize OpenAI client
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY || 'your-api-key',
});
/**
 * AI Trainer chat endpoint
 */
exports.aiTrainerChat = functions.https.onCall(async (data, context) => {
    var _a, _b;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = context.auth.uid;
    const { message, conversationId } = data;
    if (!message || typeof message !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Message is required');
    }
    try {
        // Fetch user context
        const userDoc = await db.doc(`users/${userId}`).get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'User not found');
        }
        const user = userDoc.data();
        // Fetch current workout plan
        const workoutQuery = await db
            .collection('workoutPlans')
            .where('userId', '==', userId)
            .where('status', '==', 'active')
            .limit(1)
            .get();
        const workoutPlan = workoutQuery.empty ? null : workoutQuery.docs[0].data();
        // Fetch recent progress
        const progressQuery = await db
            .collection('progressLogs')
            .where('userId', '==', userId)
            .orderBy('date', 'desc')
            .limit(5)
            .get();
        const recentProgress = progressQuery.docs.map((doc) => doc.data());
        // Build system prompt with context
        const systemPrompt = buildSystemPrompt(user, workoutPlan, recentProgress);
        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message },
            ],
            temperature: 0.7,
            max_tokens: 500,
        });
        const aiResponse = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || 'I apologize, I could not generate a response.';
        // Store conversation
        const conversationRef = conversationId
            ? db.doc(`aiConversations/${conversationId}`)
            : db.collection('aiConversations').doc();
        await conversationRef.set(Object.assign({ userId, gymId: user.gymId, messages: admin.firestore.FieldValue.arrayUnion({ role: 'user', content: message, timestamp: new Date() }, { role: 'assistant', content: aiResponse, timestamp: new Date() }), status: 'active', updatedAt: admin.firestore.FieldValue.serverTimestamp() }, (conversationId ? {} : { createdAt: admin.firestore.FieldValue.serverTimestamp() })), { merge: true });
        return {
            response: aiResponse,
            conversationId: conversationRef.id,
        };
    }
    catch (error) {
        console.error('AI Trainer error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get AI response');
    }
});
function buildSystemPrompt(user, workoutPlan, progress) {
    const profile = user.profile || {};
    const goals = user.goals || {};
    const physical = user.physicalDetails || {};
    let prompt = `You are a certified professional fitness trainer AI assistant for a premium gym.

USER PROFILE:
- Name: ${profile.firstName || 'User'}
- Primary Goal: ${goals.primary || 'general fitness'}
- Experience Level: ${goals.experienceLevel || 'beginner'}
- Current Weight: ${physical.currentWeight || 'unknown'} kg
- Target Weight: ${goals.targetWeight || 'not set'} kg`;
    if (workoutPlan) {
        prompt += `

CURRENT WORKOUT PLAN:
- Plan Name: ${workoutPlan.name}
- Week: ${workoutPlan.currentWeek || 1} of ${workoutPlan.totalWeeks || '∞'}
- Days per week: ${workoutPlan.daysPerWeek || 4}`;
    }
    else {
        prompt += `

CURRENT WORKOUT PLAN: None assigned`;
    }
    if (progress.length > 0) {
        prompt += `

RECENT PROGRESS (last 5 entries):`;
        progress.forEach((p) => {
            var _a;
            prompt += `\n- ${p.date}: ${((_a = p.measurements) === null || _a === void 0 ? void 0 : _a.weight) || 'no weight'} kg`;
        });
    }
    prompt += `

GUIDELINES:
1. Provide specific, actionable fitness advice tailored to the user's goal
2. Consider the user's experience level in all recommendations
3. Be encouraging, supportive, and motivating
4. NEVER give medical advice or diagnose conditions
5. NEVER prescribe specific supplements or medications
6. Recommend consulting professionals for injuries or health concerns
7. Keep responses concise and easy to follow (max 200 words)
8. Use bullet points and clear formatting for exercise lists
9. Focus recommendations on: ${goals.primary || 'general fitness'}

LIMITATIONS:
- Do not diagnose medical conditions
- Do not recommend specific supplement dosages
- Do not make claims about treating diseases
- Always suggest consulting a doctor for health issues`;
    return prompt;
}
//# sourceMappingURL=aiTrainer.js.map