import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { cancelMPSubscription } from '@/lib/mercadopago-subscriptions'

/**
 * POST /api/subscriptions/cancel
 * Cancel current subscription
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get user's organization
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { organizationId: true, role: true }
        })

        if (!currentUser?.organizationId) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            )
        }

        // Only admin can cancel subscriptions
        if (currentUser.role !== 'admin') {
            return NextResponse.json(
                { error: 'Only administrators can cancel subscriptions' },
                { status: 403 }
            )
        }

        // Get subscription
        const subscription = await prisma.subscription.findUnique({
            where: { organizationId: currentUser.organizationId }
        })

        if (!subscription) {
            return NextResponse.json(
                { error: 'No active subscription found' },
                { status: 404 }
            )
        }

        // Cancel in Mercado Pago if has preapprovalId
        if (subscription.preapprovalId) {
            const mpResult = await cancelMPSubscription(subscription.preapprovalId)

            if (!mpResult.success) {
                console.error('Failed to cancel MP subscription:', mpResult.error)
                // Continue anyway to update local DB
            }
        }

        // Update subscription to cancel at period end
        await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                cancelAtPeriodEnd: true,
                status: 'paused'
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Subscription will be cancelled at the end of the current billing period',
            endsAt: subscription.currentPeriodEnd
        })
    } catch (error) {
        console.error('Error cancelling subscription:', error)
        return NextResponse.json(
            { error: 'Failed to cancel subscription' },
            { status: 500 }
        )
    }
}
