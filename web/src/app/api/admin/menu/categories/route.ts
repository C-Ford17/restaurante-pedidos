import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user organization
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { organizationId: true }
    })

    if (!user?.organizationId) {
        return NextResponse.json({ error: 'No organization found' }, { status: 400 })
    }

    try {
        const categories = await prisma.category.findMany({
            where: {
                organizationId: user.organizationId
            },
            orderBy: {
                displayOrder: 'asc'
            },
            include: {
                _count: {
                    select: { menuItems: true }
                }
            }
        })

        return NextResponse.json(categories)
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json({ error: 'Error fetching categories' }, { status: 500 })
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

    try {
        const body = await req.json()
        const { name, displayOrder, active } = body

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        const category = await prisma.category.create({
            data: {
                name,
                displayOrder: displayOrder || 0,
                active: active ?? true,
                organizationId: user.organizationId
            }
        })

        return NextResponse.json(category)
    } catch (error) {
        console.error('Error creating category:', error)
        return NextResponse.json({ error: 'Error creating category' }, { status: 500 })
    }
}
