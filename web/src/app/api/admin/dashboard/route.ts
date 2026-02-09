import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { getColombiaDateRange, toColombiaDateString } from '@/lib/date-utils'

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
        const url = new URL(req.url)
        const startDateParam = url.searchParams.get('startDate')
        const endDateParam = url.searchParams.get('endDate')

        // Use Colombia adjusted range
        const { start, end } = getColombiaDateRange(startDateParam, endDateParam)

        // 1. Fetch Orders in Range
        const orders = await prisma.order.findMany({
            where: {
                organizationId,
                createdAt: {
                    gte: start,
                    lte: end
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
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // 2. Calculate Stats
        const paidOrders = orders.filter(o => o.status === 'pagado')
        const totalSales = paidOrders.reduce((acc, o) => acc + Number(o.total), 0)
        const tipsTotal = paidOrders.reduce((acc, o) => acc + Number(o.tipAmount), 0)

        // 3. Sales History (Group by Day)
        const salesHistoryMap = new Map<string, number>()
        paidOrders.forEach(o => {
            // Adjust for timezone (UTC-5) manually for valid daily grouping
            const dateStr = toColombiaDateString(o.createdAt)

            const current = salesHistoryMap.get(dateStr) || 0
            salesHistoryMap.set(dateStr, current + Number(o.total))
        })
        const salesHistory = Array.from(salesHistoryMap.entries()).map(([date, total]) => ({
            date,
            total
        })).sort((a, b) => a.date.localeCompare(b.date))

        // 4. Payment Methods
        const paymentMethodsMap = new Map<string, { total: number, count: number }>()
        paidOrders.forEach(o => {
            o.transactions.forEach(t => {
                if (t.completed) {
                    const method = t.paymentMethod
                    const current = paymentMethodsMap.get(method) || { total: 0, count: 0 }
                    paymentMethodsMap.set(method, {
                        total: current.total + Number(t.amount),
                        count: current.count + 1
                    })
                }
            })
        })
        const paymentMethods = Array.from(paymentMethodsMap.entries()).map(([method, data]) => ({
            method,
            total: data.total,
            count: data.count
        }))

        // 5. Tips Breakdown (By Waiter)
        const tipsMap = new Map<string, { total: number, count: number }>()
        let ordersWithTips = 0

        paidOrders.forEach(o => {
            if (Number(o.tipAmount) > 0) {
                ordersWithTips++
                const waiterName = o.waiter?.name || 'Sistema' // Fallback for self-service or unassigned
                const current = tipsMap.get(waiterName) || { total: 0, count: 0 }
                tipsMap.set(waiterName, {
                    total: current.total + Number(o.tipAmount),
                    count: current.count + 1
                })
            }
        })

        const tipsBreakdown = {
            totalTips: tipsTotal,
            ordersWithTips,
            averageTip: ordersWithTips > 0 ? tipsTotal / ordersWithTips : 0,
            byWaiter: Array.from(tipsMap.entries()).map(([waiterName, data]) => ({
                waiterName,
                totalTips: data.total,
                ordersCount: data.count
            })).sort((a, b) => b.totalTips - a.totalTips)
        }

        // 6. Top Items (Quantity Sold) & Sales by Dish
        const itemsMap = new Map<string, { name: string, category: string, quantity: number, total: number, price: number }>()

        paidOrders.forEach(o => {
            o.items.forEach(item => {
                const id = item.menuItemId
                const current = itemsMap.get(id) || {
                    name: item.menuItem.name,
                    category: item.menuItem.category,
                    quantity: 0,
                    total: 0,
                    price: Number(item.unitPrice)
                }
                itemsMap.set(id, {
                    ...current,
                    quantity: current.quantity + item.quantity,
                    total: current.total + (Number(item.unitPrice) * item.quantity)
                })
            })
        })

        const topItems = Array.from(itemsMap.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10)

        const salesByDish = Array.from(itemsMap.values())
            .sort((a, b) => b.total - a.total)

        // 7. Kitchen Stats
        const kitchenStatsRaw = await prisma.itemTimeStat.findMany({
            where: {
                menuItem: { organizationId },
                date: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                menuItem: true
            }
        })

        const kitchenMap = new Map<string, {
            name: string,
            category: string,
            totalPrep: number,
            totalTimeMin: number,
            minTime: number,
            maxTime: number
        }>()

        kitchenStatsRaw.forEach(stat => {
            const id = stat.menuItemId
            const current = kitchenMap.get(id) || {
                name: stat.menuItem.name,
                category: stat.menuItem.category,
                totalPrep: 0,
                totalTimeMin: 0,
                minTime: Number(stat.minTimeMinutes) || 999,
                maxTime: 0
            }

            kitchenMap.set(id, {
                name: current.name,
                category: current.category,
                totalPrep: current.totalPrep + stat.totalPreparations,
                totalTimeMin: current.totalTimeMin + (Number(stat.avgTimeMinutes) * stat.totalPreparations),
                minTime: Math.min(current.minTime, Number(stat.minTimeMinutes) || 999),
                maxTime: Math.max(current.maxTime, Number(stat.maxTimeMinutes) || 0)
            })
        })

        const kitchenStats = Array.from(kitchenMap.values()).map(k => ({
            name: k.name,
            category: k.category,
            totalPreparations: k.totalPrep,
            avgTime: k.totalPrep > 0 ? k.totalTimeMin / k.totalPrep : 0,
            minTime: k.minTime === 999 ? 0 : k.minTime,
            maxTime: k.maxTime
        })).sort((a, b) => b.avgTime - a.avgTime)


        return NextResponse.json({
            stats: {
                totalSales,
                ordersCount: orders.length,
                paidOrders: paidOrders.length,
                tipsTotal
            },
            salesHistory,
            paymentMethods,
            tipsBreakdown,
            topItems,
            salesByDish,
            kitchenStats,
            allPaidOrders: paidOrders.map(o => ({
                id: o.id,
                tableNumber: o.tableNumber,
                waiterName: o.waiter?.name || 'Sistema',
                total: Number(o.total),
                transactions: o.transactions.map(t => ({
                    paymentMethod: t.paymentMethod,
                    amount: Number(t.amount)
                })),
                createdAt: o.createdAt.toISOString()
            })),
            recentOrders: orders.slice(0, 50).map(o => ({
                id: o.id,
                tableNumber: o.tableNumber,
                waiterName: o.waiter?.name || 'Sin Asignar',
                total: o.total,
                status: o.status,
                createdAt: o.createdAt,
                itemCount: o.items.length
            }))
        })

    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
