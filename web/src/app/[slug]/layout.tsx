import { ReactNode } from 'react'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function SlugLayout({
    children,
    params
}: {
    children: ReactNode
    params: Promise<{ slug: string }>
}) {
    // Await params to get the slug
    const { slug } = await params

    // Basic verification of organization existence
    const organization = await prisma.organization.findUnique({
        where: { slug }
    })

    if (!organization) {
        notFound()
    }

    return (
        <div className="min-h-screen">
            {children}
        </div>
    )
}
