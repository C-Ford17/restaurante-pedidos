
import prisma from './prisma'

/**
 * Calculates the available stock for a menu item.
 * If useInventory is true, it calculates based on ingredients.
 * If false, it uses the currentStock field of the MenuItem.
 */
export async function calculateAvailableStock(menuItemId: string) {
    const item = await prisma.menuItem.findUnique({
        where: { id: menuItemId },
        include: {
            ingredients: {
                include: {
                    inventoryItem: true
                }
            }
        }
    })

    if (!item) return 0

    if (!item.useInventory) {
        return item.currentStock ?? 9999 // If null, assume unlimited or not tracked
    }

    if (item.ingredients.length === 0) return 0

    // For ingredients, find the limiting factor
    let minPossible = Infinity

    for (const ing of item.ingredients) {
        const available = Number(ing.inventoryItem.currentStock)
        const required = Number(ing.quantityRequired)

        if (required <= 0) continue

        const possible = Math.floor(available / required)
        if (possible < minPossible) {
            minPossible = possible
        }
    }

    return minPossible === Infinity ? 0 : minPossible
}

/**
 * Deducts stock for an order item.
 */
export async function deductStock(tx: any, menuItemId: string, quantity: number) {
    const item = await tx.menuItem.findUnique({
        where: { id: menuItemId },
        include: {
            ingredients: true
        }
    })

    if (!item) return

    if (!item.useInventory) {
        if (item.currentStock !== null) {
            await tx.menuItem.update({
                where: { id: menuItemId },
                data: {
                    currentStock: {
                        decrement: quantity
                    }
                }
            })
        }
    } else {
        // Deduct from inventory items
        for (const ing of item.ingredients) {
            await tx.inventoryItem.update({
                where: { id: ing.inventoryItemId },
                data: {
                    currentStock: {
                        decrement: Number(ing.quantityRequired) * quantity
                    }
                }
            })
        }
    }
}

/**
 * Validates that all items in an order have enough stock.
 * Returns an array of items that don't have enough stock.
 */
export async function validateStock(items: { menuItemId: string, quantity: number }[]) {
    const errors: { name: string, available: number, requested: number }[] = []

    for (const orderItem of items) {
        const available = await calculateAvailableStock(orderItem.menuItemId)
        if (available < orderItem.quantity) {
            const item = await prisma.menuItem.findUnique({ where: { id: orderItem.menuItemId }, select: { name: true } })
            errors.push({
                name: item?.name || 'Unknown',
                available,
                requested: orderItem.quantity
            })
        }
    }

    return errors
}
