import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function PUT(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, username } = body

        if (!name || !username) {
            return NextResponse.json({ error: 'Name and username are required' }, { status: 400 })
        }

        // Check if username is already taken by another user
        const existingUser = await prisma.user.findFirst({
            where: {
                username,
                id: { not: session.user.id }
            }
        })

        if (existingUser) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name,
                username
            }
        })

        return NextResponse.json({
            id: updatedUser.id,
            name: updatedUser.name,
            username: updatedUser.username
        })
    } catch (error) {
        console.error('Error updating user:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
