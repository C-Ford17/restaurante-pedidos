
import { NextRequest, NextResponse } from 'next/server'
import { auth, signIn } from '@/auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { username, password } = body

        // This is a "login" action but we want to return the session or token 
        // We can't easily re-issue a full session cookie from an API route in NextAuth v5 without the signIn flow
        // However, the client is asking for a "switch account" mechanism.
        // The most robust way in NextAuth v5 with the current setup is to use the existing credentials provider.

        // We will verify credentials here manually to ensure they are valid before the client tries to "switch"
        // But the actual session switch happens on the client by calling signIn again.

        // Wait, if we want "fast switch" without re-entering password every time, we need a way to store multiple sessions or tokens.
        // Since NextAuth is session-based (usually 1 cookie), we can't easily have multiple active sessions in the same browser *simultaneously* driven by NextAuth cookies.

        // Strategy: 
        // 1. Client stores a list of "known accounts" (username, maybe an encrypted token or just remembers usernames).
        // 2. To switch, if we want it "passwordless" after the first time, we'd need a custom token mechanism.
        // 3. User request: "like facebook/instagram... add accounts... switch fast".
        //    Social apps usually store a refresh token for each account.

        // SIMPLIFIED APPROACH for this project:
        // The user effectively logs out and logs in as the new user, but the UI makes it look like a switch.
        // We will implement "Add Account" which is just a Login form that doesn't replace the current user *in the UI list* until success.

        // Actually, the request implies storing the credential. Storing passwords is bad.
        // We can't easily implement true multi-account session management without significant overhaul of auth.
        // 
        // Fallback: The "Add Account" button will just be a login screen. 
        // The "Switch" will require entering the password? Or can we simulate it?
        // 
        // Let's implement the "UI" part first: A list of users.
        // When clicking a user, if it's not the current one, we prompt for password OR if we want to be insecure/simple for a POS (often shared device), maybe a PIN?
        // 
        // Let's stick to the prompt: "add accounts and log in and stays saved".
        // We will use LocalStorage on the client to store "known_users" (avatar, name, username).
        // To switch, we unfortunately need the password again unless we persist a token.
        // 
        // BETTER APPROACH for seamless switch:
        // We create a custom "switch" action that validates credentials and sets the session.
        // But since we can't set the cookie easily from here for NextAuth...

        // Let's try to verify credentials here so the frontend knows it can proceed.
        // But wait, the standard `signIn` server action is what sets the cookie.

        if (!username || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
        }

        const user = await prisma.user.findFirst({
            where: { username }
        })

        if (!user || user.password !== password) { // Plaintext password check as per current schema (migrated)
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        // If valid, return user info so frontend can add to "known accounts" list
        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                role: user.role,
                organizationId: user.organizationId
            }
        })

    } catch (error) {
        console.error('Switch account check error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
