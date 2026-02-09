import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { getColombiaDateRange } from '@/lib/date-utils'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { organizationId: true, role: true }
        })

        if (!user?.organizationId) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
        }

        // Get today's start and end adjusted for Colombia Time (UTC-5)
        const { start, end } = getColombiaDateRange()

        const orders = await prisma.order.findMany({
            where: {
                organizationId: user.organizationId,
                status: 'pagado',
                createdAt: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                transactions: {
                    where: { completed: true },
                    orderBy: { createdAt: 'desc' }
                },
                waiter: {
                    select: { name: true }
                },
                items: {
                    select: { id: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        const processedSales = orders.map(order => {
            // Find the last transaction time as the "payment time"
            const lastTransaction = order.transactions[0]
            const paymentTime = lastTransaction ? lastTransaction.createdAt : order.createdAt

            return {
                id: order.id,
                tableNumber: order.tableNumber,
                waiterName: order.waiter?.name || '---',
                total: Number(order.total),
                tipAmount: Number(order.tipAmount),
                itemCount: order.items.length,
                paymentTime: paymentTime.toISOString(),
                createdAt: order.createdAt.toISOString(),
                paymentMethods: order.transactions.map(t => t.paymentMethod)
            }
        })

        return NextResponse.json(processedSales)
    } catch (error) {
        console.error('Error fetching cashier sales:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
