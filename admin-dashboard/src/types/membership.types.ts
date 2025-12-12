// Membership Types

export interface Membership {
    id: string
    userId: string
    branchId: string
    gymId: string
    planId: string
    planSnapshot: MembershipPlanSnapshot
    startDate: Date
    endDate: Date
    pausedAt?: Date
    pausedUntil?: Date
    price: number
    currency: string
    discount?: Discount
    finalPrice: number
    paymentId?: string
    autoRenew: boolean
    renewalRemindersSent: number[]
    status: MembershipStatus
    cancellationReason?: string
    createdAt: Date
    updatedAt: Date
    createdBy: string
}

export type MembershipStatus = 'pending' | 'active' | 'expired' | 'cancelled' | 'paused'

export interface MembershipPlanSnapshot {
    name: string
    durationDays: number
    price: number
    currency: string
    features: string[]
}

export interface MembershipPlan {
    id: string
    gymId: string
    branchId?: string
    name: string
    description: string
    durationDays: number
    price: number
    currency: string
    features: string[]
    limits?: PlanLimits
    displayOrder: number
    isPopular: boolean
    badge?: string
    color?: string
    isActive: boolean
    validFrom?: Date
    validUntil?: Date
    createdAt: Date
    updatedAt: Date
}

export interface PlanLimits {
    classesPerMonth?: number
    guestPasses?: number
    freezeDays?: number
}

export interface Discount {
    type: 'percentage' | 'fixed'
    value: number
    code?: string
}
