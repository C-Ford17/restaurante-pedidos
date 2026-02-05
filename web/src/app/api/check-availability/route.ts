import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { type, value } = body

        if (!type || !value) {
            return NextResponse.json(
                { error: 'Type and value are required' },
                { status: 400 }
            )
        }

        let isAvailable = false

        switch (type) {
            case 'slug':
                // Check if slug is already taken
                const org = await prisma.organization.findUnique({
                    where: { slug: value.toLowerCase() }
                })
                isAvailable = !org
                break

            case 'email':
                // Check if email is already registered
                // Email is stored in the organization's contactEmail or user's username
                const orgByEmail = await prisma.organization.findFirst({
                    where: {
                        users: {
                            some: {
                                username: value.toLowerCase()
                            }
                        }
                    }
                })
                isAvailable = !orgByEmail
                break

            case 'username':
                // Check if username is already taken
                const userByUsername = await prisma.user.findFirst({
                    where: { username: value.toLowerCase() }
                })
                isAvailable = !userByUsername
                break

            default:
                return NextResponse.json(
                    { error: 'Invalid type. Must be: slug, email, or username' },
                    { status: 400 }
                )
        }

        return NextResponse.json({ available: isAvailable })
    } catch (error) {
        console.error('Error checking availability:', error)
        return NextResponse.json(
            { error: 'Failed to check availability' },
            { status: 500 }
        )
    }
}
