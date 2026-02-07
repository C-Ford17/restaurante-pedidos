
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await context.params

    const menuItem = await prisma.menuItem.findUnique({
        where: { id },
        include: {
            ingredients: true
        }
    })

    if (!menuItem) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json(menuItem)
}

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await context.params

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { organizationId: true }
    })

    if (!user?.organizationId) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    try {
        const body = await req.json()
        const {
            name,
            price,
            category,
            description,
            estimatedTime,
            available,
            imageUrl,
            useInventory,
            isDirect,
            ingredients
        } = body

        // Check if item belongs to org
        const existingItem = await prisma.menuItem.findFirst({
            where: {
                id,
                organizationId: user.organizationId
            }
        })

        if (!existingItem) {
            return NextResponse.json({ error: 'Item not found or access denied' }, { status: 404 })
        }

        const updatedItem = await prisma.menuItem.update({
            where: { id },
            data: {
                name,
                price: parseFloat(price),
                category,
                description,
                estimatedTime: parseInt(estimatedTime),
                available,
                imageUrl,
                useInventory,
                isDirect,
                currentStock: useInventory ? null : (body.currentStock ? parseInt(body.currentStock) : null),
                // Handle ingredients update
                ingredients: ingredients ? {
                    deleteMany: {}, // Clear existing
                    create: ingredients.map((ing: any) => ({
                        inventoryItemId: ing.inventoryItemId,
                        quantityRequired: ing.quantityRequired
                    }))
                } : undefined
            }
        })

        return NextResponse.json(updatedItem)
    } catch (error) {
        console.error('Error updating menu item:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await context.params

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { organizationId: true }
    })

    try {
        const existingItem = await prisma.menuItem.findFirst({
            where: {
                id,
                organizationId: user?.organizationId
            }
        })

        if (!existingItem) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 })
        }

        await prisma.menuItem.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting menu item:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
