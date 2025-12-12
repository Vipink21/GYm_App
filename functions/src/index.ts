import * as admin from 'firebase-admin'

admin.initializeApp()

// Export all functions
export * from './payments'
export * from './qrCheckIn'
export * from './aiTrainer'
export * from './scheduled'
export * from './triggers'
