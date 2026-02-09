import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { useLanguage } from '@/components/providers/language-provider'


export default async function DashboardPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const session = await auth()
    const { slug } = await params

    const role = session?.user?.role

    if (role === 'admin') {
        redirect(`/${slug}/admin/dashboard`)
    } else if (role === 'mesero') {
        redirect(`/${slug}/waiter`)
    } else if (role === 'cocinero') {
        redirect(`/${slug}/kitchen`)
    } else if (role === 'cajero') {
        redirect(`/${slug}/cashier`)
    }

    // For unknown roles or fallback, show empty div or generic dashboard
    return null
}
