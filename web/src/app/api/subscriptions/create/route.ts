import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { createMPSubscription, getPlanLimits, getNextBillingDate, getTrialEndDate, PLAN_PRICING, type PlanType } from '@/lib/mercadopago-subscriptions'

/**
 * POST /api/subscriptions/create
 * Create a new subscription with Mercado Pago
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id || !session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get user's organization
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { organization: true }
        })

        if (!currentUser?.organizationId || !currentUser.organization) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            )
        }

        // Only admin can create subscriptions
        if (currentUser.role !== 'admin') {
            return NextResponse.json(
                { error: 'Only administrators can manage subscriptions' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { plan } = body as { plan: PlanType }

        if (!plan || !['basic', 'professional', 'enterprise'].includes(plan)) {
            return NextResponse.json(
                { error: 'Invalid plan' },
                { status: 400 }
            )
        }

        // Check if already has active subscription
        const existingSubscription = await prisma.subscription.findUnique({
            where: { organizationId: currentUser.organizationId }
        })

        if (existingSubscription && existingSubscription.status === 'authorized') {
            return NextResponse.json(
                { error: 'Already has an active subscription' },
                { status: 400 }
            )
        }

        // Create subscription in Mercado Pago
        const mpResult = await createMPSubscription({
            plan,
            organizationId: currentUser.organization.slug,
            organizationName: currentUser.organization.name,
            userEmail: session.user.email,
            trialDays: 7
        })

        if (!mpResult.success || !mpResult.preapprovalId || !mpResult.initPoint) {
            return NextResponse.json(
                { error: mpResult.error || 'Failed to create subscription' },
                { status: 500 }
            )
        }

        // Save subscription in database
        const limits = getPlanLimits(plan)
        const trialEnd = getTrialEndDate(7)
        const nextBilling = getNextBillingDate(trialEnd)

        if (existingSubscription) {
            // Update existing
            await prisma.subscription.update({
                where: { id: existingSubscription.id },
                data: {
                    plan,
                    status: 'pending',
                    preapprovalId: mpResult.preapprovalId,
                    amount: PLAN_PRICING[plan],
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: nextBilling,
                    nextBillingDate: nextBilling,
                    paymentFailures: 0,
                    gracePeriodUntil: null
                }
            })
        } else {
            // Create new
            await prisma.subscription.create({
                data: {
                    organizationId: currentUser.organizationId,
                    plan,
                    status: 'pending',
                    preapprovalId: mpResult.preapprovalId,
                    amount: PLAN_PRICING[plan],
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: nextBilling,
                    nextBillingDate: nextBilling
                }
            })
        }

        // Update organization
        await prisma.organization.update({
            where: { id: currentUser.organizationId },
            data: {
                subscriptionPlan: plan,
                subscriptionStatus: 'trial',
                trialEndsAt: trialEnd,
                maxTables: limits.maxTables,
                maxUsers: limits.maxUsers
            }
        })

        return NextResponse.json({
            success: true,
            initPoint: mpResult.initPoint,
            message: 'Subscription created. Redirecting to payment...'
        })
    } catch (error) {
        console.error('Error creating subscription:', error)
        return NextResponse.json(
            { error: 'Failed to create subscription' },
            { status: 500 }
        )
    }
}
