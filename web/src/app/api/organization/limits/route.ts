import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getUsageLimits } from '@/lib/subscription-limits'
import prisma from '@/lib/prisma'

/**
 * GET /api/organization/limits
 * Get current usage and limits for the authenticated user's organization
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get user's organization
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { organizationId: true }
        })

        if (!user?.organizationId) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            )
        }

        // Get usage limits
        const limits = await getUsageLimits(user.organizationId)

        return NextResponse.json(limits)
    } catch (error) {
        console.error('Error fetching organization limits:', error)
        return NextResponse.json(
            { error: 'Failed to fetch limits' },
            { status: 500 }
        )
    }
}
