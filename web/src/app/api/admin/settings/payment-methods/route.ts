import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

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
        const paymentMethods = await prisma.paymentMethod.findMany({
            where: {
                organizationId: user.organizationId
            },
            orderBy: {
                id: 'asc'
            }
        })

        return NextResponse.json(paymentMethods)
    } catch (error) {
        console.error('Error fetching payment methods:', error)
        return NextResponse.json({ error: 'Error fetching payment methods' }, { status: 500 })
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
        const { name, label, isDigital, active } = body

        if (!name || !label) {
            return NextResponse.json({ error: 'Name and Label are required' }, { status: 400 })
        }

        // Ensure name is slug-like
        const slugName = name.toLowerCase().replace(/\s+/g, '_')

        const paymentMethod = await prisma.paymentMethod.create({
            data: {
                name: slugName,
                label,
                isDigital: isDigital || false,
                active: active ?? true,
                organizationId: user.organizationId
            }
        })

        return NextResponse.json(paymentMethod)
    } catch (error) {
        console.error('Error creating payment method:', error)
        return NextResponse.json({ error: 'Error creating payment method' }, { status: 500 })
    }
}
