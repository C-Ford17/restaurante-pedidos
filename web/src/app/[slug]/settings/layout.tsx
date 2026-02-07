'use client'

import { ReactNode, use } from 'react'
import Link from 'next/link'
import { CreditCard, Users, LayoutGrid, ArrowLeft, Building2, UserCircle } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'

export default function SettingsLayout({
    children,
    params
}: {
    children: ReactNode
    params: Promise<{ slug: string }>
}) {
    const { t } = useLanguage()
    const { slug } = use(params)

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button */}
            <Link
                href={`/${slug}/dashboard`}
                className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft size={16} />
                {t('settings.backToDashboard')}
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {t('settings.title')}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                    {t('settings.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <aside className="lg:col-span-1">
                    <nav className="space-y-1 bg-white dark:bg-slate-800 rounded-lg p-2 shadow-sm">
                        <SettingsNavLink
                            href={`/${slug}/settings/subscription`}
                            icon={<CreditCard size={18} />}
                            label={t('settings.subscription.title')}
                        />
                        <SettingsNavLink
                            href={`/${slug}/settings/organization`}
                            icon={<Building2 size={18} />}
                            label={t('settings.organization.title')}
                        />
                        <SettingsNavLink
                            href={`/${slug}/settings/account`}
                            icon={<UserCircle size={18} />}
                            label={t('settings.account.title')}
                        />
                        <SettingsNavLink
                            href={`/${slug}/settings/users`}
                            icon={<Users size={18} />}
                            label={t('settings.users.title')}
                        />
                        <SettingsNavLink
                            href={`/${slug}/settings/tables`}
                            icon={<LayoutGrid size={18} />}
                            label={t('settings.tables.title')}
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
