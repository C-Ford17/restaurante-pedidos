import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const slug = searchParams.get('slug')

        if (!slug) {
            return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
        }

        const organization = await prisma.organization.findUnique({
            where: { slug },
            select: { id: true }
        })

        if (!organization) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
        }

        const items = await prisma.menuItem.findMany({
            where: {
                organizationId: organization.id,
                available: true
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
                category: 'asc'
            }
        })

        // Calculate available stock for each item
        const itemsWithStock = items.map(item => {
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
                // Remove ingredients to keep payload clean
                ingredients: undefined,
                calculatedStock: stock
            }
        })

        return NextResponse.json({ items: itemsWithStock })
    } catch (error) {
        console.error('Error fetching public menu:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
