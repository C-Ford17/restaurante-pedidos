
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    const { id } = await context.params

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
        const inventoryItem = await prisma.inventoryItem.findFirst({
            where: {
                id,
                organizationId: user.organizationId
            }
        })

        if (!inventoryItem) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 })
        }

        return NextResponse.json(inventoryItem)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    const { id } = await context.params

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

        const inventoryItem = await prisma.inventoryItem.update({
            where: {
                id,
                organizationId: user.organizationId
            },
            data: {
                name,
                unit,
                currentStock: parseFloat(currentStock),
                minStock: parseFloat(minStock),
                costPerUnit: parseFloat(costPerUnit)
            }
        })

        return NextResponse.json(inventoryItem)
    } catch (error) {
        console.error('Error updating inventory item:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    const { id } = await context.params

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
        await prisma.inventoryItem.delete({
            where: {
                id,
                organizationId: user.organizationId
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting inventory item:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
