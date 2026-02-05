import { ReactNode } from 'react'
import Link from 'next/link'
import { CreditCard, Users, LayoutGrid, ArrowLeft } from 'lucide-react'

export default async function SettingsLayout({
    children,
    params
}: {
    children: ReactNode
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button */}
            <Link
                href={`/${slug}/dashboard`}
                className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft size={16} />
                Volver al Dashboard
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Configuración
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                    Gestiona la configuración de tu organización
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <aside className="lg:col-span-1">
                    <nav className="space-y-1 bg-white dark:bg-slate-800 rounded-lg p-2 shadow-sm">
                        <SettingsNavLink
                            href={`/${slug}/settings/subscription`}
                            icon={<CreditCard size={18} />}
                            label="Suscripción"
                        />
                        <SettingsNavLink
                            href={`/${slug}/settings/users`}
                            icon={<Users size={18} />}
                            label="Usuarios"
                        />
                        <SettingsNavLink
                            href={`/${slug}/settings/tables`}
                            icon={<LayoutGrid size={18} />}
                            label="Mesas"
                        />
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="lg:col-span-3">
                    {children}
                </main>
            </div>
        </div>
    )
}

function SettingsNavLink({ href, icon, label }: { href: string, icon: ReactNode, label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
            {icon}
            <span className="font-medium">{label}</span>
        </Link>
    )
}
