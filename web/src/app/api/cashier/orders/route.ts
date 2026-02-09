import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

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

        // Fetch active orders (not cancelled, not fully paid unless just updated)
        // We fetch all orders that are NOT 'cancelado' or 'pagado'
        // OR orders that are 'pagado' but updated recently (optional, for now just active)
        const orders = await prisma.order.findMany({
            where: {
                organizationId: user.organizationId,
                status: {
                    in: ['nuevo', 'en_cocina', 'listo', 'servido', 'listo_pagar']
                }
            },
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
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Fetch tip percentage and payment methods
        const organization = await prisma.organization.findUnique({
            where: { id: user.organizationId },
            select: {
                name: true,
                nit: true,
                tipPercentage: true,
                paymentMethods: {
                    where: { active: true },
                    select: { name: true, label: true, isDigital: true }
                }
            }
        })

        const tipPercentage = organization?.tipPercentage || 10
        const paymentMethods = organization?.paymentMethods || []

        // Process orders to calculate paid amounts
        const processedOrders = orders.map(order => {
            const total = Number(order.total)
            const totalPaid = order.transactions
                .filter(t => t.completed)
                .reduce((acc, t) => acc + Number(t.amount), 0)

            const tipPaid = order.transactions
                .filter(t => t.completed)
                .reduce((acc, t) => acc + Number(t.tipAmount), 0)

            return {
                ...order,
                total,
                totalPaid,
                tipPaid,
                remaining: Math.max(0, total - totalPaid)
            }
        })

        return NextResponse.json({
            orders: processedOrders,
            organization,
            tipPercentage,
            paymentMethods
        })
    } catch (error) {
        console.error('Error fetching cashier orders:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
