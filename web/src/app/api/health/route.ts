import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        console.log('Attempting DB connection...');
        await prisma.$connect();
        console.log('DB connection successful');
        return NextResponse.json({ status: 'ok', database: 'connected' });
    } catch (error: any) {
        console.error('HEALTH CHECK ERROR:', error);
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
