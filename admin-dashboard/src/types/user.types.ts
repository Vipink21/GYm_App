// User Types
export type UserRole = 'member' | 'trainer' | 'admin' | 'superadmin'

export interface User {
    id: string
    gymId: string
    branchId: string
    role: UserRole
    profile: UserProfile
    physicalDetails?: PhysicalDetails
    goals?: FitnessGoals
    trainerDetails?: TrainerDetails
    assignedTrainerId?: string
    fcmTokens?: Record<string, FCMToken>
    preferences: UserPreferences
    stats?: UserStats
    status: 'active' | 'inactive' | 'suspended'
    onboardingCompleted: boolean
    createdAt: Date
    updatedAt: Date
    lastActiveAt: Date
}

export interface UserProfile {
    firstName: string
    lastName: string
    displayName: string
    email?: string
    phone: string
    photoUrl?: string
    gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
    dateOfBirth: Date
    bio?: string
}

export interface PhysicalDetails {
    height: number
    initialWeight: number
    currentWeight: number
    bloodGroup?: string
    medicalConditions?: string[]
    allergies?: string[]
}

export interface FitnessGoals {
    primary: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'strength' | 'endurance' | 'flexibility'
    targetWeight?: number
    experienceLevel: 'beginner' | 'intermediate' | 'advanced'
    preferredWorkoutDays: number
    notes?: string
}

export interface TrainerDetails {
    specializations: string[]
    certifications: string[]
    experience: number
    maxClients: number
    currentClients: number
    rating: number
    reviewCount: number
}

export interface FCMToken {
    token: string
    platform: 'ios' | 'android' | 'web'
    updatedAt: Date
}

export interface UserPreferences {
    language: string
    notifications: NotificationPreferences
    privacy: PrivacyPreferences
}

export interface NotificationPreferences {
    push: boolean
    email: boolean
    sms: boolean
    workoutReminders: boolean
    classReminders: boolean
    membershipAlerts: boolean
    promotions: boolean
}

export interface PrivacyPreferences {
    showProgress: boolean
    showInLeaderboard: boolean
}

export interface UserStats {
    totalWorkouts: number
    totalClasses: number
    currentStreak: number
    longestStreak: number
    lastCheckIn?: Date
}
