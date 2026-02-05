import prisma from '@/lib/prisma'

export interface UsageLimits {
    tables: {
        current: number
        max: number
        percentage: number
        canAdd: boolean
        isUnlimited: boolean
    }
    users: {
        current: number
        max: number
        percentage: number
        canAdd: boolean
        isUnlimited: boolean
    }
}

/**
 * Get current usage and limits for an organization
 */
export async function getUsageLimits(organizationId: string): Promise<UsageLimits> {
    const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: {
            _count: {
                select: {
                    tables: true,
                    users: {
                        // Exclude admin from user count
                        where: {
                            role: {
                                not: 'admin'
                            }
                        }
                    }
                }
            }
        }
    })

    if (!org) {
        throw new Error('Organization not found')
    }

    // 999 represents unlimited
    const isTablesUnlimited = org.maxTables >= 999
    const isUsersUnlimited = org.maxUsers >= 999

    return {
        tables: {
            current: org._count.tables,
            max: org.maxTables,
            percentage: isTablesUnlimited ? 0 : (org._count.tables / org.maxTables) * 100,
            canAdd: isTablesUnlimited || org._count.tables < org.maxTables,
            isUnlimited: isTablesUnlimited
        },
        users: {
            current: org._count.users, // This now excludes admin
            max: org.maxUsers,
            percentage: isUsersUnlimited ? 0 : (org._count.users / org.maxUsers) * 100,
            canAdd: isUsersUnlimited || org._count.users < org.maxUsers,
            isUnlimited: isUsersUnlimited
        }
    }
}

/**
 * Check if organization can add a new table
 */
export async function checkTableLimit(organizationId: string): Promise<boolean> {
    const limits = await getUsageLimits(organizationId)
    return limits.tables.canAdd
}

/**
 * Check if organization can add a new user
 */
export async function checkUserLimit(organizationId: string): Promise<boolean> {
    const limits = await getUsageLimits(organizationId)
    return limits.users.canAdd
}

/**
 * Get organization with usage statistics
 */
export async function getOrganizationWithUsage(organizationId: string) {
    const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: {
            subscription: true,
            _count: {
                select: {
                    tables: true,
                    users: true,
                    menuItems: true,
                    orders: true
                }
            }
        }
    })

    if (!org) {
        throw new Error('Organization not found')
    }

    const limits = await getUsageLimits(organizationId)

    return {
        ...org,
        usage: limits
    }
}
