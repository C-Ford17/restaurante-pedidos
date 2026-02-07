'use client'

import { PublicNavbar } from '@/components/public/navbar'
import { PublicFooter } from '@/components/public/footer'
import { Container } from '@/components/ui/container'
import { useLanguage } from '@/components/providers/language-provider'
import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'

export default function PricingPage() {
    const { t } = useLanguage()

    const plans = [
        {
            nameKey: 'pricing.starter.name',
            price: 60000,
            descKey: 'pricing.starter.desc',
            popular: false,
            features: [
                'pricing.feature.tables5',
                'pricing.feature.users2',
                'pricing.feature.basicOrders',
                'pricing.feature.monthlyReports',
                'pricing.feature.emailSupport',
                'pricing.feature.updates'
            ]
        },
        {
            nameKey: 'pricing.professional.name',
            price: 100000,
            descKey: 'pricing.professional.desc',
            popular: true,
            features: [
                'pricing.feature.tables20',
                'pricing.feature.users10',
                'pricing.feature.fullOrders',
                'pricing.feature.realtimeReports',
                'pricing.feature.prioritySupport',
                'pricing.feature.kitchenIntegration',
                'pricing.feature.inventory',
                'pricing.feature.advancedStats'
            ]
        },
        {
            nameKey: 'pricing.enterprise.name',
            price: 400000,
            descKey: 'pricing.enterprise.desc',
            popular: false,
            features: [
                'pricing.feature.unlimitedTables',
                'pricing.feature.unlimitedUsers',
                'pricing.feature.multiRestaurant',
                'pricing.feature.customReports',
                'pricing.feature.support24',
                'pricing.feature.api',
                'pricing.feature.accountManager',
                'pricing.feature.customization'
            ]
        }
    ]

    const faqs = [
        { qKey: 'pricing.faq.q1', aKey: 'pricing.faq.a1' },
        { qKey: 'pricing.faq.q2', aKey: 'pricing.faq.a2' },
        { qKey: 'pricing.faq.q3', aKey: 'pricing.faq.a3' },
        { qKey: 'pricing.faq.q4', aKey: 'pricing.faq.a4' },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
            <PublicNavbar />

            <section className="py-12 sm:py-20">
                <Container>
                    <div className="text-center mb-12 sm:mb-16 px-4">
                        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4">
                            {t('pricing.title')}
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                            {t('pricing.subtitle')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-4">
                        {plans.map((plan, index) => (
                            <div
                                key={index}
                                className={`bg-white dark:bg-slate-800 rounded-2xl border-2 p-8 relative ${plan.popular
                                    ? 'border-orange-500 dark:border-orange-600 shadow-2xl shadow-orange-500/20 scale-105'
                                    : 'border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-600 dark:bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                                        {t('pricing.popular')}
                                    </div>
                                )}

                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t(plan.nameKey)}</h3>
                                    <div className="flex items-baseline justify-center gap-1 mb-4">
                                        <span className="text-5xl font-black text-slate-900 dark:text-white">${plan.price}</span>
                                        <span className="text-slate-600 dark:text-slate-400">{t('pricing.perMonth')}</span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300">{t(plan.descKey)}</p>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((featureKey, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <Check className="text-green-600 dark:text-green-500 shrink-0 mt-0.5" size={20} />
                                            <span className="text-slate-700 dark:text-slate-300">{t(featureKey)}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href="/register"
                                    className={`block text-center py-3 px-6 rounded-xl font-bold transition-all ${plan.popular
                                        ? 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30'
                                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white'
                                        }`}
                                >
                                    {t('pricing.cta')}
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* FAQ Section */}
                    <div className="mt-20 max-w-3xl mx-auto px-4">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 text-center">
                            {t('pricing.faq.title')}
                        </h2>
                        <div className="space-y-6">
                            {faqs.map((faq, index) => (
                                <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">{t(faq.qKey)}</h3>
                                    <p className="text-slate-600 dark:text-slate-300">{t(faq.aKey)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-20 text-center bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-600 dark:to-orange-800 rounded-2xl p-12">
                        <h2 className="text-3xl font-black text-white mb-4">
                            {t('pricing.contact.title')}
                        </h2>
                        <p className="text-xl text-orange-100 mb-6">
                            {t('pricing.contact.subtitle')}
                        </p>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-xl font-bold hover:bg-orange-50 transition-all"
                        >
                            {t('pricing.contact.button')} <ArrowRight size={20} />
                        </Link>
                    </div>
                </Container>
            </section>

            <PublicFooter />
        </div>
    )
}
