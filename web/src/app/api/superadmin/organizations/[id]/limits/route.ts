import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const requester = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        })

        if (requester?.role !== 'superadmin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { id } = await params
        const body = await req.json()
        const { maxUsers, maxTables, maxMenuItems, subscriptionPlan, subscriptionStatus } = body

        const updatedOrg = await prisma.organization.update({
            where: { id },
            data: {
                maxUsers: maxUsers !== undefined ? parseInt(maxUsers) : undefined,
                maxTables: maxTables !== undefined ? parseInt(maxTables) : undefined,
                maxMenuItems: maxMenuItems !== undefined ? parseInt(maxMenuItems) : (maxMenuItems === null ? null : undefined),
                subscriptionPlan: subscriptionPlan || undefined,
                subscriptionStatus: subscriptionStatus || undefined
            }
        })

        return NextResponse.json({
            success: true,
            organization: updatedOrg
        })

    } catch (error) {
        console.error('Error in superadmin limits API:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
