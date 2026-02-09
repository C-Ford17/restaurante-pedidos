
import { NextRequest, NextResponse } from 'next/server';
import Ably from 'ably';
import { auth } from '@/auth';
import crypto from 'crypto';

export const GET = async (req: NextRequest) => {
    try {
        const session = await auth();

        // If authenticated, use user ID. If not (customer), generate a random ID
        const clientId = session?.user?.id || `customer-${crypto.randomUUID()}`;

        const client = new Ably.Rest({ key: process.env.ABLY_API_KEY as string });
        const tokenRequestData = await client.auth.createTokenRequest({
            clientId: clientId,
            // Optional: Limit capabilities for customers?
            // capability: session?.user?.id ? { "*": ["*"] } : { [`orders:*`]: ["subscribe"] }
        });

        return NextResponse.json(tokenRequestData);
    } catch (error) {
        console.error('Error creating Ably token request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
};
