import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
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
        <main className="max-w-[1600px] mx-auto px-4 py-6">
            {children}
        </main>
    )
}
