import { auth } from '@/auth'
import Navbar from '@/components/dashboard/navbar'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

export default async function SettingsRootLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: Promise<{ slug: string }>
}) {
    const session = await auth()

    if (!session?.user) {
        redirect('/login')
    }

    const { slug } = await params

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Navbar user={session.user} slug={slug} />
            <main className="max-w-[1600px] mx-auto px-4 py-6">
                {children}
            </main>
        </div>
    )
}
