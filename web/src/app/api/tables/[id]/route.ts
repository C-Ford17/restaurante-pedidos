import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

/**
 * PUT /api/tables/[id]
 * Update a table
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        // Only admin can update tables
        if (currentUser.role !== 'admin') {
            return NextResponse.json(
                { error: 'Only administrators can update tables' },
                { status: 403 }
            )
        }

        const { id: idParam } = await params
        const body = await request.json()
        const { number, capacity, isBlockable } = body

        // Validate required fields
        if (!number || !capacity) {
            return NextResponse.json(
                { error: 'Número y capacidad son requeridos' },
                { status: 400 }
            )
        }

        // Convert id to number
        const id = parseInt(idParam)

        // Check if table exists and belongs to organization
        const existingTable = await prisma.table.findFirst({
            where: {
                id,
                organizationId: currentUser.organizationId
            }
        })

        if (!existingTable) {
            return NextResponse.json(
                { error: 'Mesa no encontrada' },
                { status: 404 }
            )
        }

        // Check if new number conflicts with another table
        const conflictingTable = await prisma.table.findFirst({
            where: {
                number: parseInt(number),
                organizationId: currentUser.organizationId,
                NOT: { id }
            }
        })

        if (conflictingTable) {
            return NextResponse.json(
                { error: 'Ya existe una mesa con ese número' },
                { status: 400 }
            )
        }

        // Update table
        const updatedTable = await prisma.table.update({
            where: { id },
            data: {
                number: parseInt(number),
                capacity: parseInt(capacity),
                isBlockable: isBlockable ?? existingTable.isBlockable
            }
        })

        return NextResponse.json(updatedTable)
    } catch (error) {
        console.error('Error updating table:', error)
        return NextResponse.json(
            { error: 'Failed to update table' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/tables/[id]
 * Delete a table
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        // Only admin can delete tables
        if (currentUser.role !== 'admin') {
            return NextResponse.json(
                { error: 'Only administrators can delete tables' },
                { status: 403 }
            )
        }

        const { id: idParam } = await params

        // Convert id to number
        const id = parseInt(idParam)

        // Check if table exists and belongs to organization
        const existingTable = await prisma.table.findFirst({
            where: {
                id,
                organizationId: currentUser.organizationId
            }
        })

        if (!existingTable) {
            return NextResponse.json(
                { error: 'Mesa no encontrada' },
                { status: 404 }
            )
        }

        // Delete table
        await prisma.table.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting table:', error)
        return NextResponse.json(
            { error: 'Failed to delete table' },
            { status: 500 }
        )
    }
}
