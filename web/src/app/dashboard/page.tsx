import { auth } from '@/auth'
import { LanguageWrapper } from '@/components/dashboard/language-wrapper'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const session = await auth()
    const user = session?.user

    // Auto-redirect admins to their dashboard if slug is available
    if (user?.role === 'admin' && user?.organizationSlug) {
        redirect(`/${user.organizationSlug}/admin/dashboard`)
    }

    return (
        <LanguageWrapper>
            <div className="flex flex-col items-center justify-center h-[70vh] text-center gap-6 p-4">
                <div className="mb-2 w-20 h-20 rounded-2xl bg-gradient-to-tr from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700 shadow-xl shadow-orange-500/20 flex items-center justify-center text-white text-3xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>

                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        <span data-translate="dashboard.welcome">Welcome,</span> {user?.name}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-lg leading-relaxed" data-translate="dashboard.subtitle">
                        Select a menu option to start managing your restaurant.
                    </p>
                </div>

                <div className="inline-flex items-center gap-3 bg-white dark:bg-slate-800 px-6 py-3 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm mt-4 backdrop-blur-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="font-mono text-sm text-slate-400 dark:text-slate-500">
                        <span data-translate="dashboard.role">Role:</span> <span className="text-slate-700 dark:text-slate-200 font-bold uppercase tracking-wide ml-1">{user?.role}</span>
                    </p>
                </div>
            </div>
        </LanguageWrapper>
    )
}
