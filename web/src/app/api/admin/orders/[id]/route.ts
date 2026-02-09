import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: orderId } = await params
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify organization ownership
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { organizationId: true }
        })

        if (!user?.organizationId) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { organizationId: true }
        })

        if (!order || order.organizationId !== user.organizationId) {
            return NextResponse.json({ error: 'Order not found or permission denied' }, { status: 404 })
        }

        // Delete order items first (Prisma handles this if cascading is on, but let's be explicit if needed)
        // Actually, order items and transactions should be deleted.

        await prisma.$transaction([
            prisma.orderItem.deleteMany({ where: { orderId } }),
            prisma.transaction.deleteMany({ where: { orderId } }),
            prisma.order.delete({ where: { id: orderId } })
        ])

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting order:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: orderId } = await params
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { organizationId: true }
        })

        if (!user?.organizationId) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        menuItem: true
                    }
                },
                transactions: true,
                waiter: {
                    select: { name: true }
                }
            }
        })

        if (!order || order.organizationId !== user.organizationId) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        return NextResponse.json(order)
    } catch (error) {
        console.error('Error fetching order:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
