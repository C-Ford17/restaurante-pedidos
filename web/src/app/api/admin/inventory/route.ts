import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
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

    try {
        const inventoryItems = await prisma.inventoryItem.findMany({
            where: {
                organizationId: user.organizationId
            },
            orderBy: { name: 'asc' }
        })
        return NextResponse.json(inventoryItems)
    } catch (error) {
        console.error('Error fetching inventory items:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
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

    try {
        const body = await req.json()
        const { name, unit, currentStock, minStock, costPerUnit } = body

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        const inventoryItem = await prisma.inventoryItem.create({
            data: {
                name,
                unit: unit || 'kg',
                currentStock: parseFloat(currentStock || '0'),
                minStock: parseFloat(minStock || '0'),
                costPerUnit: parseFloat(costPerUnit || '0'),
                organizationId: user.organizationId
            }
        })

        return NextResponse.json(inventoryItem)
    } catch (error) {
        console.error('Error creating inventory item:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
