import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { useLanguage } from '@/components/providers/language-provider'
import ClientDashboard from './client-page' // We'll move the UI here if needed, or just inline a simple welcome

export default async function DashboardPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const session = await auth()
    const { slug } = await params

    if (session?.user?.role === 'admin') {
        redirect(`/${slug}/admin/dashboard`)
    }

    // For non-admins, show the welcome screen (or redirect to their specific panel)
    return <ClientDashboard />
}
