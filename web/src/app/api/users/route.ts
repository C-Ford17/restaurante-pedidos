import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { checkUserLimit } from '@/lib/subscription-limits'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

/**
 * POST /api/users
 * Create a new user
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get user's organization
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { organizationId: true, role: true }
        })

        if (!currentUser?.organizationId) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            )
        }

        // Only admin can create users
        if (currentUser.role !== 'admin') {
            return NextResponse.json(
                { error: 'Only administrators can create users' },
                { status: 403 }
            )
        }

        // Check user limit
        const canAdd = await checkUserLimit(currentUser.organizationId)
        if (!canAdd) {
            return NextResponse.json(
                { error: 'Has alcanzado el límite de usuarios de tu plan' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { name, username, password, role } = body

        // Validate required fields
        if (!name || !username || !password || !role) {
            return NextResponse.json(
                { error: 'Todos los campos son requeridos' },
                { status: 400 }
            )
        }

        // Check if username already exists
        const existingUser = await prisma.user.findFirst({
            where: { username }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'El usuario ya existe' },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const newUser = await prisma.user.create({
            data: {
                name,
                username,
                password: hashedPassword,
                role,
                organizationId: currentUser.organizationId
            },
            select: {
                id: true,
                name: true,
                username: true,
                role: true,
                createdAt: true
            }
        })

        return NextResponse.json(newUser, { status: 201 })
    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/users
 * Get all users from organization
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get user's organization
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { organizationId: true }
        })

        if (!currentUser?.organizationId) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            )
        }

        // Get all users from organization (excluding passwords)
        const users = await prisma.user.findMany({
            where: { organizationId: currentUser.organizationId },
            select: {
                id: true,
                name: true,
                username: true,
                role: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(users)
    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        )
    }
}
