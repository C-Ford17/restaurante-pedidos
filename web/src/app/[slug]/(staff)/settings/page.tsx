import { redirect } from 'next/navigation'

export default async function SettingsPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    // Redirect to subscription page by default
    redirect(`/${slug}/settings/subscription`)
}
