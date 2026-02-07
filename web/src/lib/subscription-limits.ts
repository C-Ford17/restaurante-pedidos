import prisma from '@/lib/prisma'

export async function checkMenuItemLimit(organizationId: string): Promise<boolean> {
    // Fetch organization subscription details
    const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
            subscriptionPlan: true,
            maxMenuItems: true
        }
    })

    if (!organization) return false

    // If maxMenuItems is null, it's unlimited
    if (organization.maxMenuItems === null || organization.maxMenuItems === undefined) {
        return true
    }

    // Count active menu items
    const activeMenuItems = await prisma.menuItem.count({
        where: {
            organizationId,
            available: true
        }
    })

    return activeMenuItems < organization.maxMenuItems
}

export async function getMenuItemLimit(organizationId: string) {
    const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { maxMenuItems: true }
    })
    return organization?.maxMenuItems ?? null
}

export async function getOrganizationWithUsage(organizationId: string) {
    const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: {
            _count: {
                select: {
                    menuItems: { where: { available: true } },
                    tables: true,
                    users: true
                }
            }
        }
    })

    if (!organization) return null

    return {
        ...organization,
        usage: {
            menuItems: organization._count.menuItems,
            tables: organization._count.tables,
            users: organization._count.users
        }
    }
}

export async function getMenuItemCount(organizationId: string) {
    return await prisma.menuItem.count({
        where: { organizationId }
    })
}
