import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const slug = searchParams.get('slug')
        const tableNumber = searchParams.get('table')

        if (!slug || !tableNumber) {
            return NextResponse.json({ error: 'Slug and table number are required' }, { status: 400 })
        }

        const organization = await prisma.organization.findUnique({
            where: { slug },
            select: { id: true, tipPercentage: true }

        })

        if (!organization) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
        }

        const activeOrder = await prisma.order.findFirst({
            where: {
                organizationId: organization.id,
                tableNumber: parseInt(tableNumber),
                status: {
                    notIn: ['cancelado', 'pagado', 'cerrado']
                }
            },
            include: {
                items: {
                    include: {
                        menuItem: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        if (!activeOrder) {
            return NextResponse.json({ active: false })
        }

        return NextResponse.json({
            active: true,
            order: activeOrder,
            organizationId: organization.id,
            tipPercentage: organization.tipPercentage ?? 10
        })
    } catch (error) {
        console.error('Error fetching public active order:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
