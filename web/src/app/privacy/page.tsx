'use client'

import { PublicNavbar } from '@/components/public/navbar'
import { PublicFooter } from '@/components/public/footer'
import { Container } from '@/components/ui/container'
import { useLanguage } from '@/components/providers/language-provider'
import { Shield } from 'lucide-react'

export default function PrivacyPage() {
    const { t } = useLanguage()

    const sections = [
        { titleKey: 'privacy.section1.title', contentKey: 'privacy.section1.content' },
        { titleKey: 'privacy.section2.title', contentKey: 'privacy.section2.content' },
        { titleKey: 'privacy.section3.title', contentKey: 'privacy.section3.content' },
        { titleKey: 'privacy.section4.title', contentKey: 'privacy.section4.content' },
        { titleKey: 'privacy.section5.title', contentKey: 'privacy.section5.content' },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
            <PublicNavbar />

            <section className="py-12 sm:py-20">
                <Container>
                    <div className="max-w-4xl mx-auto px-4">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl mb-4">
                                <Shield className="text-orange-600 dark:text-orange-500" size={32} />
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4">
                                {t('privacy.title')}
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t('privacy.subtitle')}
                            </p>
                        </div>

                        {/* Introduction */}
                        <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-xl p-6 mb-8">
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                {t('privacy.intro')}
                            </p>
                        </div>

                        {/* Sections */}
                        <div className="space-y-8 mb-12">
                            {sections.map((section, index) => (
                                <div key={index} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                        {t(section.titleKey)}
                                    </h2>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {t(section.contentKey)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Contact */}
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 text-center">
                            <p className="text-slate-600 dark:text-slate-300">
                                {t('privacy.contact')}
                            </p>
                        </div>
                    </div>
                </Container>
            </section>

            <PublicFooter />
        </div>
    )
}
