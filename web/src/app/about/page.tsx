'use client'

import { PublicNavbar } from '@/components/public/navbar'
import { PublicFooter } from '@/components/public/footer'
import { Container } from '@/components/ui/container'
import { useLanguage } from '@/components/providers/language-provider'
import { Target, Eye, Heart, Users } from 'lucide-react'

export default function AboutPage() {
    const { t } = useLanguage()

    const values = [
        {
            icon: Heart,
            titleKey: 'about.value1.title',
            descKey: 'about.value1.desc'
        },
        {
            icon: Target,
            titleKey: 'about.value2.title',
            descKey: 'about.value2.desc'
        },
        {
            icon: Eye,
            titleKey: 'about.value3.title',
            descKey: 'about.value3.desc'
        },
        {
            icon: Users,
            titleKey: 'about.value4.title',
            descKey: 'about.value4.desc'
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
            <PublicNavbar />

            <section className="py-12 sm:py-20">
                <Container>
                    <div className="max-w-4xl mx-auto px-4">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4">
                                {t('about.title')}
                            </h1>
                            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300">
                                {t('about.subtitle')}
                            </p>
                        </div>

                        {/* Mission & Vision */}
                        <div className="grid md:grid-cols-2 gap-8 mb-16">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                    {t('about.mission.title')}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {t('about.mission.content')}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                    {t('about.vision.title')}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {t('about.vision.content')}
                                </p>
                            </div>
                        </div>

                        {/* Values */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 text-center">
                                {t('about.values.title')}
                            </h2>

                            <div className="grid sm:grid-cols-2 gap-6">
                                {values.map((value, index) => (
                                    <div key={index} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
                                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                                            <value.icon className="text-orange-600 dark:text-orange-500" size={24} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                            {t(value.titleKey)}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-300">
                                            {t(value.descKey)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <PublicFooter />
        </div>
    )
}
