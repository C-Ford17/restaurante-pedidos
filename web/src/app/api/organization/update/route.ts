import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function PUT(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user's organization
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { organization: true }
        })

        if (!user || !user.organizationId) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
        }

        // Only admins can update organization details
        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
        }

        const body = await request.json()
        const { nit, phone, phoneCountry, email } = body

        // Validate email format if provided
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
        }

        // Update organization
        const updatedOrganization = await prisma.organization.update({
            where: { id: user.organizationId },
            data: {
                nit: nit || null,
                phone: phone || null,
                phoneCountry: phoneCountry || '+57',
                email: email || null
            }
        })

        return NextResponse.json(updatedOrganization)
    } catch (error) {
        console.error('Error updating organization:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
