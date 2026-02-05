'use client'

import LoginForm from './login-form'
import { PublicNavbar } from '@/components/public/navbar'
import { PublicFooter } from '@/components/public/footer'
import { Container } from '@/components/ui/container'
import { useLanguage } from '@/components/providers/language-provider'
import { UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
            <PublicNavbar />

            <section className="py-12 flex items-center justify-center min-h-[calc(100vh-200px)]">
                <Container>
                    <div className="max-w-md mx-auto">
                        {/* Logo and Title */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl mb-4">
                                <UtensilsCrossed className="text-orange-600 dark:text-orange-500" size={32} />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                                {t('login.title')}
                            </h1>
                            <p className="text-slate-600 dark:text-slate-300">
                                {t('login.subtitle')}
                            </p>
                        </div>

                        {/* Login Form Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
                            <LoginForm />
                        </div>

                        {/* Register Link */}
                        <p className="text-center mt-6 text-slate-600 dark:text-slate-400">
                            {t('login.noAccount')}{' '}
                            <Link href="/register" className="text-orange-600 dark:text-orange-500 font-semibold hover:underline">
                                {t('login.registerLink')}
                            </Link>
                        </p>
                    </div>
                </Container>
            </section>

            <PublicFooter />
        </div>
    )
}
