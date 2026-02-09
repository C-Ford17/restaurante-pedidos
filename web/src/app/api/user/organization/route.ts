import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get user with organization
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                organization: {
                    select: {
                        id: true,
                        slug: true,
                        name: true
                    }
                }
            }
        })

        if (!user || !user.organization) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            slug: user.organization.slug,
            organizationId: user.organization.id,
            organizationName: user.organization.name,
            role: user.role
        })
    } catch (error) {
        console.error('Error fetching user organization:', error)
        return NextResponse.json(
            { error: 'Failed to fetch organization' },
            { status: 500 }
        )
    }
}
