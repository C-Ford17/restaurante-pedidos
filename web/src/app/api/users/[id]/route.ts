import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

/**
 * DELETE /api/users/[id]
 * Delete a user
 */
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get current user's organization and role
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

        // Only admin can delete users
        if (currentUser.role !== 'admin') {
            return NextResponse.json(
                { error: 'Only administrators can delete users' },
                { status: 403 }
            )
        }

        // Get user to delete
        const userToDelete = await prisma.user.findUnique({
            where: { id },
            select: { organizationId: true, role: true, id: true }
        })

        if (!userToDelete) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Check if user belongs to same organization
        if (userToDelete.organizationId !== currentUser.organizationId) {
            return NextResponse.json(
                { error: 'Cannot delete users from other organizations' },
                { status: 403 }
            )
        }

        // Prevent deleting yourself
        if (userToDelete.id === session.user.id) {
            return NextResponse.json(
                { error: 'Cannot delete your own account' },
                { status: 400 }
            )
        }

        // Prevent deleting admin users
        if (userToDelete.role === 'admin') {
            return NextResponse.json(
                { error: 'Cannot delete admin users' },
                { status: 400 }
            )
        }

        // Delete user
        await prisma.user.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting user:', error)
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        )
    }
}
