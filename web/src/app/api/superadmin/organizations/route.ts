import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

/**
 * PATCH /api/superadmin/organizations/[id]/limits
 * Permite a un superadmin actualizar los límites de una organización específica.
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verificar que el usuario tenga el rol de superadmin
        // Nota: El rol 'superadmin' debe ser asignado manualmente en la DB para el primer usuario
        const requester = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        })

        if (requester?.role !== 'superadmin') {
            return NextResponse.json({ error: 'Forbidden: Superadmin access required' }, { status: 403 })
        }

        const { id } = await params
        const body = await req.json()
        const { maxUsers, maxTables, maxMenuItems, subscriptionPlan, subscriptionStatus } = body

        // Validar que la organización exista
        const org = await prisma.organization.findUnique({
            where: { id }
        })

        if (!org) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
        }

        // Actualizar límites
        const updatedOrg = await prisma.organization.update({
            where: { id },
            data: {
                maxUsers: maxUsers !== undefined ? parseInt(maxUsers) : undefined,
                maxTables: maxTables !== undefined ? parseInt(maxTables) : undefined,
                maxMenuItems: maxMenuItems !== undefined ? parseInt(maxMenuItems) : undefined,
                subscriptionPlan,
                subscriptionStatus
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

/**
 * GET /api/superadmin/organizations
 * Lista todas las organizaciones (para el futuro panel de control)
 */
export async function GET(req: NextRequest) {
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

        const organizations = await prisma.organization.findMany({
            include: {
                _count: {
                    select: { users: true, tables: true, menuItems: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(organizations)

    } catch (error) {
        console.error('Error in superadmin list API:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
