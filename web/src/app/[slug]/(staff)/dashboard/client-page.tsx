'use client'

import { useLanguage } from '@/components/providers/language-provider'

export default function ClientDashboard() {
    const { t } = useLanguage()

    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('dashboard.welcome')}</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md">
                {t('dashboard.subtitle')}
            </p>
        </div>
    )
}
