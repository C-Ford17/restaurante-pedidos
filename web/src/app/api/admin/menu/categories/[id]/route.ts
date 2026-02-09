import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { organizationId: true, role: true }
    })

    if (!user?.organizationId || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    try {
        // Verify ownership
        const existing = await prisma.category.findUnique({
            where: { id }
        })

        if (!existing || existing.organizationId !== user.organizationId) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 })
        }

        const body = await req.json()
        const { name, displayOrder, active } = body

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        const category = await prisma.category.update({
            where: { id },
            data: {
                name,
                displayOrder: displayOrder || 0,
                active: active ?? true
            }
        })

        return NextResponse.json(category)
    } catch (error) {
        console.error('Error updating category:', error)
        return NextResponse.json({ error: 'Error updating category' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { organizationId: true, role: true }
    })

    if (!user?.organizationId || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    try {
        // Verify ownership
        const existing = await prisma.category.findUnique({
            where: { id }
        })

        if (!existing || existing.organizationId !== user.organizationId) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 })
        }

        // Check if has items (optional, but good practice)
        // For now, let's just delete forcefully or handle error if foreign key constraints fail

        await prisma.category.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting category:', error)
        // Check for foreign key constraint
        if ((error as any).code === 'P2003') {
            return NextResponse.json({ error: 'Cannot delete category with associated items' }, { status: 400 })
        }
        return NextResponse.json({ error: 'Error deleting category' }, { status: 500 })
    }
}
