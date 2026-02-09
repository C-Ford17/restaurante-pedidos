
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        // Get "Today" in Colombia (UTC-5)
        const now = new Date()
        const colTime = new Date(now.getTime() - (5 * 60 * 60 * 1000))
        const today = new Date(colTime.toISOString().split('T')[0] + 'T00:00:00Z')

        // 1. Get all completed items for today with valid timestamps
        const completedItems = await prisma.orderItem.findMany({
            where: {
                status: { in: ['listo', 'servido'] }, // Include servido as they are also completed
                completedAt: {
                    gte: today
                },
                startedAt: {
                    not: null
                }
            },
            select: {
                menuItemId: true,
                startedAt: true,
                completedAt: true
            }
        })

        if (completedItems.length === 0) {
            return NextResponse.json({ message: 'No completed items found for today', count: 0 })
        }

        // 2. Group statistics by MenuItem
        const statsMap = new Map<string, {
            count: number,
            totalMinutes: number,
            minMinutes: number,
            maxMinutes: number
        }>()

        for (const item of completedItems) {
            if (!item.startedAt || !item.completedAt) continue

            // Calculate duration in minutes (float)
            const durationMs = item.completedAt.getTime() - item.startedAt.getTime()
            const durationMinutes = durationMs / 60000

            if (durationMinutes < 0) continue // Skip invalid times

            const current = statsMap.get(item.menuItemId) || {
                count: 0,
                totalMinutes: 0,
                minMinutes: 999999,
                maxMinutes: 0
            }

            statsMap.set(item.menuItemId, {
                count: current.count + 1,
                totalMinutes: current.totalMinutes + durationMinutes,
                minMinutes: Math.min(current.minMinutes, durationMinutes),
                maxMinutes: Math.max(current.maxMinutes, durationMinutes)
            })
        }

        // 3. Update ItemTimeStat records
        let updatedCount = 0
        const results = []

        for (const [menuItemId, stats] of statsMap.entries()) {
            const avgMinutes = stats.totalMinutes / stats.count

            // Upsert: Create or Update existing record for (menuItemId + date)
            const record = await prisma.itemTimeStat.upsert({
                where: {
                    menuItemId_date: {
                        menuItemId,
                        date: today
                    }
                },
                create: {
                    menuItemId,
                    date: today,
                    totalPreparations: stats.count,
                    avgTimeMinutes: avgMinutes,
                    minTimeMinutes: Math.floor(stats.minMinutes),
                    maxTimeMinutes: Math.ceil(stats.maxMinutes),
                    // Legacy fields (optional, can keep 0 or populate)
                    avgTimeSeconds: Math.round(avgMinutes * 60),
                },
                update: {
                    totalPreparations: stats.count,
                    avgTimeMinutes: avgMinutes,
                    minTimeMinutes: Math.floor(stats.minMinutes),
                    maxTimeMinutes: Math.ceil(stats.maxMinutes),
                    avgTimeSeconds: Math.round(avgMinutes * 60),
                    updatedAt: new Date()
                }
            })

            results.push(record)
            updatedCount++
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${completedItems.length} items, updated stats for ${updatedCount} dishes`,
            stats: results
        })

    } catch (error) {
        console.error('Kitchen stats calculation error:', error)
        return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
    }
}
