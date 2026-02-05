import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { checkTableLimit } from '@/lib/subscription-limits'
import prisma from '@/lib/prisma'

/**
 * POST /api/tables
 * Create a new table
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

        // Only admin can create tables
        if (currentUser.role !== 'admin') {
            return NextResponse.json(
                { error: 'Only administrators can create tables' },
                { status: 403 }
            )
        }

        // Check table limit
        const canAdd = await checkTableLimit(currentUser.organizationId)
        if (!canAdd) {
            return NextResponse.json(
                { error: 'Has alcanzado el límite de mesas de tu plan' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { number, capacity } = body

        // Validate required fields
        if (!number || !capacity) {
            return NextResponse.json(
                { error: 'Número y capacidad son requeridos' },
                { status: 400 }
            )
        }

        // Check if table number already exists
        const existingTable = await prisma.table.findFirst({
            where: {
                number,
                organizationId: currentUser.organizationId
            }
        })

        if (existingTable) {
            return NextResponse.json(
                { error: 'Ya existe una mesa con ese número' },
                { status: 400 }
            )
        }

        // Create table
        const newTable = await prisma.table.create({
            data: {
                number: parseInt(number),
                capacity: parseInt(capacity),
                organizationId: currentUser.organizationId
            }
        })

        return NextResponse.json(newTable, { status: 201 })
    } catch (error) {
        console.error('Error creating table:', error)
        return NextResponse.json(
            { error: 'Failed to create table' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/tables
 * Get all tables from organization
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
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { organizationId: true }
        })

        if (!currentUser?.organizationId) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            )
        }

        // Get all tables from organization
        const tables = await prisma.table.findMany({
            where: { organizationId: currentUser.organizationId },
            orderBy: {
                number: 'asc'
            }
        })

        return NextResponse.json(tables)
    } catch (error) {
        console.error('Error fetching tables:', error)
        return NextResponse.json(
            { error: 'Failed to fetch tables' },
            { status: 500 }
        )
    }
}
