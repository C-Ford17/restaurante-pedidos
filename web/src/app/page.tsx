'use client'

import { PublicNavbar } from '@/components/public/navbar'
import { PublicFooter } from '@/components/public/footer'
import { Container } from '@/components/ui/container'
import { useLanguage } from '@/components/providers/language-provider'
import Link from 'next/link'
import { ArrowRight, Zap, Shield, BarChart3, Users, Clock, CheckCircle } from 'lucide-react'

export default function HomePage() {
  const { t } = useLanguage()

  const features = [
    {
      icon: Zap,
      titleKey: 'landing.feature.orders.title',
      descKey: 'landing.feature.orders.desc'
    },
    {
      icon: Users,
      titleKey: 'landing.feature.tables.title',
      descKey: 'landing.feature.tables.desc'
    },
    {
      icon: Clock,
      titleKey: 'landing.feature.kitchen.title',
      descKey: 'landing.feature.kitchen.desc'
    },
    {
      icon: BarChart3,
      titleKey: 'landing.feature.reports.title',
      descKey: 'landing.feature.reports.desc'
    },
    {
      icon: Shield,
      titleKey: 'landing.feature.security.title',
      descKey: 'landing.feature.security.desc'
    },
    {
      icon: CheckCircle,
      titleKey: 'landing.feature.easy.title',
      descKey: 'landing.feature.easy.desc'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="py-12 sm:py-20 lg:py-28">
        <Container>
          <div className="text-center max-w-4xl mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-4 sm:mb-6 leading-tight">
              {t('landing.hero.title')}{' '}
              <span className="text-orange-600 dark:text-orange-500">{t('landing.hero.titleHighlight')}</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 leading-relaxed">
              {t('landing.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link
                href="/register"
                className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg shadow-orange-500/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                {t('landing.hero.cta')} <ArrowRight size={20} />
              </Link>
              <Link
                href="/pricing"
                className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg border-2 border-slate-200 dark:border-slate-700 transition-all hover:border-slate-300 dark:hover:border-slate-600 flex items-center justify-center gap-2"
              >
                {t('landing.hero.pricing')}
              </Link>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-4 sm:mt-6">
              {t('landing.hero.benefits')}
            </p>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
              {t('landing.features.title')}
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="text-orange-600 dark:text-orange-500" size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t(feature.titleKey)}</h3>
                <p className="text-slate-600 dark:text-slate-300">{t(feature.descKey)}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
              {t('landing.steps.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 dark:bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('landing.step1.title')}</h3>
              <p className="text-slate-600 dark:text-slate-300">{t('landing.step1.desc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 dark:bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('landing.step2.title')}</h3>
              <p className="text-slate-600 dark:text-slate-300">{t('landing.step2.desc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 dark:bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('landing.step3.title')}</h3>
              <p className="text-slate-600 dark:text-slate-300">{t('landing.step3.desc')}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-600 dark:to-orange-800">
        <Container>
          <div className="text-center text-white max-w-3xl mx-auto">
            <h2 className="text-4xl font-black mb-6">
              {t('landing.cta.title')}
            </h2>
            <p className="text-xl mb-8 text-orange-100">
              {t('landing.cta.subtitle')}
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition-all shadow-xl"
            >
              {t('landing.cta.button')} <ArrowRight size={20} />
            </Link>
          </div>
        </Container>
      </section>

      <PublicFooter />
    </div>
  )
}
