'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Container } from '@/components/ui/container'
import { useLanguage } from '@/components/providers/language-provider'
import { UtensilsCrossed, Menu, X, Globe, Moon, Sun } from 'lucide-react'

export function PublicNavbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const { language, setLanguage, t } = useLanguage()
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        setMounted(true)
    }, [])

    const toggleLanguage = () => {
        setLanguage(language === 'es' ? 'en' : 'es')
    }

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light')
    }

    return (
        <nav className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
            <Container>
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white">
                        <UtensilsCrossed className="text-orange-600 dark:text-orange-500" size={28} />
                        <span className="hidden sm:inline">RestaurantePOS</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/pricing" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">
                            {t('nav.pricing')}
                        </Link>
                        <Link href="/login" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">
                            {t('nav.login')}
                        </Link>

                        {/* Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                            aria-label="Toggle language"
                        >
                            <Globe size={18} />
                            <span className="text-sm font-medium">{language.toUpperCase()}</span>
                        </button>

                        {/* Theme Toggle */}
                        {mounted && (
                            <button
                                onClick={toggleTheme}
                                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                            </button>
                        )}

                        <Link
                            href="/register"
                            className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
                        >
                            {t('nav.register')}
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center gap-3">
                        {/* Mobile Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                            aria-label="Toggle language"
                        >
                            <Globe size={20} />
                        </button>

                        {/* Mobile Theme Toggle */}
                        {mounted && (
                            <button
                                onClick={toggleTheme}
                                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                            </button>
                        )}

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-slate-900 dark:text-white"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-col gap-4">
                            <Link
                                href="/pricing"
                                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t('nav.pricing')}
                            </Link>
                            <Link
                                href="/login"
                                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t('nav.login')}
                            </Link>
                            <Link
                                href="/register"
                                className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm text-center"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t('nav.register')}
                            </Link>
                        </div>
                    </div>
                )}
            </Container>
        </nav>
    )
}
