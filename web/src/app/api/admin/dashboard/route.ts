import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

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

        const organizationId = user.organizationId

        // Get total sales (only paid orders)
        // status: 'pagado'
        const paidOrders = await prisma.order.findMany({
            where: {
                organizationId,
                status: 'pagado'
            },
            select: {
                total: true,
                tipAmount: true
            }
        })

        const totalSales = paidOrders.reduce((acc, order) => acc + Number(order.total), 0)
        const tipsTotal = paidOrders.reduce((acc, order) => acc + Number(order.tipAmount), 0)
        const paidOrdersCount = paidOrders.length

        // Get total orders count (all statuses except maybe cancelled?)
        // Let's count everything for "Orders Count" metric
        const ordersCount = await prisma.order.count({
            where: {
                organizationId
            }
        })

        return NextResponse.json({
            totalSales,
            ordersCount,
            paidOrders: paidOrdersCount,
            tipsTotal
        })

    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
