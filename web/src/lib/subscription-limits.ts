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

export async function checkUserLimit(organizationId: string): Promise<boolean> {
    // Fetch organization subscription details
    const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
            maxUsers: true
        }
    })

    if (!organization) return false

    // If maxUsers is null, it's unlimited
    if (organization.maxUsers === null || organization.maxUsers === undefined) {
        return true
    }

    // Count current users (excluding admin)
    const currentUsers = await prisma.user.count({
        where: {
            organizationId,
            role: { not: 'admin' }
        }
    })

    return currentUsers < organization.maxUsers
}

export async function checkTableLimit(organizationId: string): Promise<boolean> {
    // Fetch organization subscription details
    const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
            maxTables: true
        }
    })

    if (!organization) return false

    // If maxTables is null, it's unlimited
    if (organization.maxTables === null || organization.maxTables === undefined) {
        return true
    }

    // Count current tables
    const currentTables = await prisma.table.count({
        where: {
            organizationId
        }
    })

    return currentTables < organization.maxTables
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
                    users: { where: { role: { not: 'admin' } } }
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
