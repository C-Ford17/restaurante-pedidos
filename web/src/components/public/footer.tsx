'use client'

import { Container } from '@/components/ui/container'
import { useLanguage } from '@/components/providers/language-provider'
import Link from 'next/link'

export function PublicFooter() {
    const { t } = useLanguage()

    return (
        <footer className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 py-12 mt-20 border-t border-slate-200 dark:border-slate-800">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4">Hamelin Foods</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {t('footer.tagline')}
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-4">{t('footer.product')}</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t('nav.pricing')}</Link></li>
                            <li><Link href="/#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t('footer.features')}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-4">{t('footer.company')}</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t('footer.about')}</Link></li>
                            <li><Link href="/contact" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t('footer.contact')}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-4">{t('footer.legal')}</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t('footer.privacy')}</Link></li>
                            <li><Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t('footer.terms')}</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-300 dark:border-slate-800 mt-8 pt-8 text-center text-sm text-slate-600 dark:text-slate-400">
                    © {new Date().getFullYear()} Hamelin Foods. {t('footer.rights')}
                </div>
            </Container>
        </footer>
    )
}
