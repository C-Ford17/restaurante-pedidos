import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { checkMenuItemLimit } from '@/lib/subscription-limits'

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
        return NextResponse.json({ error: 'No organization found' }, { status: 400 })
    }

    try {
        const menuItems = await prisma.menuItem.findMany({
            where: {
                organizationId: user.organizationId
            },
            include: {
                ingredients: {
                    include: {
                        inventoryItem: {
                            select: {
                                currentStock: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        })

        // Calculate available stock
        const itemsWithStock = menuItems.map(item => {
            let stock = item.currentStock ?? 9999

            if (item.useInventory && item.ingredients.length > 0) {
                let minPossible = Infinity
                for (const ing of item.ingredients) {
                    const available = Number(ing.inventoryItem.currentStock)
                    const required = Number(ing.quantityRequired)
                    if (required > 0) {
                        const possible = Math.floor(available / required)
                        minPossible = Math.min(minPossible, possible)
                    }
                }
                stock = minPossible === Infinity ? 0 : minPossible
            }

            return {
                ...item,
                calculatedStock: stock
            }
        })

        return NextResponse.json(itemsWithStock)
    } catch (error) {
        console.error('Error fetching menu items:', error)
        return NextResponse.json({ error: 'Error fetching menu items' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { organizationId: true, role: true }
    })

    if (!user?.organizationId || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check subscription limits
    const canCreate = await checkMenuItemLimit(user.organizationId)
    if (!canCreate) {
        return NextResponse.json(
            { error: 'Menu item limit reached for your subscription plan' },
            { status: 403 }
        )
    }

    try {
        const body = await req.json()
        const {
            name,
            price,
            category, // this is the string name
            description,
            estimatedTime,
            available,
            imageUrl,
            useInventory,
            isDirect
        } = body

        if (!name || price === undefined || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Try to find category to link relation
        const categoryRecord = await prisma.category.findUnique({
            where: { name: category }
        })

        const menuItem = await prisma.menuItem.create({
            data: {
                name,
                price: parseFloat(price),
                category: category,
                // categoryRel is handled by the scalar 'category' field automatically
                description,
                estimatedTime: parseInt(estimatedTime || '15'),
                available: available ?? true,
                imageUrl,
                useInventory: useInventory ?? false,
                isDirect: isDirect ?? false,
                organizationId: user.organizationId,
                currentStock: useInventory ? undefined : (body.currentStock !== undefined && body.currentStock !== null && body.currentStock !== '' ? parseInt(body.currentStock) : null),
                ingredients: body.ingredients ? {
                    create: body.ingredients.map((ing: any) => ({
                        inventoryItemId: ing.inventoryItemId,
                        quantityRequired: ing.quantityRequired
                    }))
                } : undefined
            }
        })

        return NextResponse.json(menuItem)
    } catch (error) {
        console.error('Error creating menu item:', error)
        return NextResponse.json({ error: 'Error creating menu item' }, { status: 500 })
    }
}
