// Common & Shared Types

export interface Gym {
    id: string
    name: string
    slug: string
    logo: string
    coverImage?: string
    ownerUserId: string
    contactEmail: string
    contactPhone: string
    website?: string
    address: Address
    subscription: GymSubscription
    settings: GymSettings
    branding: GymBranding
    status: 'active' | 'inactive' | 'suspended'
    createdAt: Date
    updatedAt: Date
}

export interface Branch {
    id: string
    gymId: string
    name: string
    code: string
    address: Address
    contactPhone: string
    contactEmail: string
    operatingHours: Record<string, OperatingHours>
    amenities: string[]
    images: string[]
    capacity: number
    managerId?: string
    razorpayAccountId?: string
    status: 'active' | 'inactive' | 'maintenance'
    createdAt: Date
    updatedAt: Date
}

export interface Address {
    line1: string
    line2?: string
    city: string
    state: string
    country: string
    postalCode: string
    coordinates?: Coordinates
}

export interface Coordinates {
    latitude: number
    longitude: number
}

export interface OperatingHours {
    isOpen: boolean
    openTime: string
    closeTime: string
}

export interface GymSubscription {
    plan: 'free' | 'basic' | 'pro' | 'enterprise'
    status: 'active' | 'suspended' | 'cancelled'
    startDate: Date
    endDate: Date
    maxBranches: number
    maxMembers: number
}

export interface GymSettings {
    currency: string
    timezone: string
    defaultLanguage: string
    features: FeatureFlags
}

export interface FeatureFlags {
    aiTrainer: boolean
    qrCheckIn: boolean
    onlinePayments: boolean
    classBooking: boolean
    progressTracking: boolean
}

export interface GymBranding {
    primaryColor: string
    secondaryColor: string
    logoLight?: string
    logoDark?: string
}

// Payment Types
export interface Payment {
    id: string
    userId: string
    gymId: string
    branchId: string
    amount: number
    currency: string
    method: PaymentMethod
    razorpay?: RazorpayDetails
    purpose: PaymentPurpose
    referenceId?: string
    description: string
    items?: PaymentItem[]
    taxAmount?: number
    taxPercentage?: number
    discountAmount?: number
    discountCode?: string
    subtotal: number
    totalAmount: number
    status: PaymentStatus
    failureReason?: string
    refund?: RefundDetails
    invoiceNumber?: string
    invoiceUrl?: string
    receivedBy?: string
    notes?: string
    createdAt: Date
    updatedAt: Date
    completedAt?: Date
}

export type PaymentMethod = 'razorpay' | 'cash' | 'card_offline' | 'upi_offline' | 'bank_transfer' | 'cheque'
export type PaymentPurpose = 'membership' | 'class_pack' | 'personal_training' | 'merchandise' | 'other'
export type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'refunded' | 'partial_refund'

export interface RazorpayDetails {
    orderId: string
    paymentId: string
    signature?: string
}

export interface PaymentItem {
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
}

export interface RefundDetails {
    amount: number
    reason: string
    refundId: string
    refundedAt: Date
    refundedBy: string
}

// Attendance Types
export interface Attendance {
    id: string
    userId: string
    gymId: string
    branchId: string
    date: string
    checkInTime: Date
    checkOutTime?: Date
    method: 'qr_code' | 'manual' | 'biometric' | 'auto'
    durationMinutes?: number
    verifiedBy?: string
    qrDeviceId?: string
    location?: Coordinates
    notes?: string
    createdAt: Date
    updatedAt: Date
}

// Class Types
export interface GymClass {
    id: string
    gymId: string
    branchId: string
    name: string
    description: string
    category: string
    dateTime: Date
    durationMinutes: number
    isRecurring: boolean
    recurringPattern?: RecurringPattern
    parentClassId?: string
    trainerId: string
    trainerSnapshot: TrainerSnapshot
    capacity: number
    bookedCount: number
    waitlistEnabled: boolean
    waitlistCount: number
    room?: string
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'all_levels'
    requirements?: string[]
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
    cancellationReason?: string
    thumbnailUrl?: string
    createdAt: Date
    updatedAt: Date
}

export interface RecurringPattern {
    frequency: 'daily' | 'weekly' | 'monthly'
    daysOfWeek?: number[]
    endDate?: Date
}

export interface TrainerSnapshot {
    name: string
    photoUrl?: string
}

export interface ClassBooking {
    id: string
    classId: string
    userId: string
    gymId: string
    branchId: string
    classSnapshot: ClassSnapshot
    bookedAt: Date
    status: BookingStatus
    waitlistPosition?: number
    cancelledAt?: Date
    cancelledBy?: string
    cancellationReason?: string
    attendedAt?: Date
    markedBy?: string
    reminderSent: boolean
    createdAt: Date
    updatedAt: Date
}

export type BookingStatus = 'confirmed' | 'waitlisted' | 'cancelled' | 'attended' | 'no_show'

export interface ClassSnapshot {
    name: string
    dateTime: Date
    trainerId: string
    trainerName: string
}
