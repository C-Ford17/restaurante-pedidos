import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: paramId } = await params
    const id = parseInt(paramId)

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { organizationId: true, role: true }
    })

    if (!user?.organizationId || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    try {
        // Verify ownership
        const existing = await prisma.paymentMethod.findUnique({
            where: { id }
        })

        if (!existing || existing.organizationId !== user.organizationId) {
            return NextResponse.json({ error: 'Payment method not found' }, { status: 404 })
        }

        const body = await req.json()
        const { label, isDigital, active } = body

        // Note: 'name' is internal slug and shouldn't change
        if (!label) {
            return NextResponse.json({ error: 'Label is required' }, { status: 400 })
        }

        const paymentMethod = await prisma.paymentMethod.update({
            where: { id },
            data: {
                label,
                isDigital: isDigital ?? false,
                active: active ?? true
            }
        })

        return NextResponse.json(paymentMethod)
    } catch (error) {
        console.error('Error updating payment method:', error)
        return NextResponse.json({ error: 'Error updating payment method' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: paramId } = await params
    const id = parseInt(paramId)

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { organizationId: true, role: true }
    })

    if (!user?.organizationId || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    try {
        // Verify ownership
        const existing = await prisma.paymentMethod.findUnique({
            where: { id }
        })

        if (!existing || existing.organizationId !== user.organizationId) {
            return NextResponse.json({ error: 'Payment method not found' }, { status: 404 })
        }

        await prisma.paymentMethod.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting payment method:', error)
        return NextResponse.json({ error: 'Error deleting payment method' }, { status: 500 })
    }
}
