'use client'

import { useState } from 'react'
import {
    UtensilsCrossed,
    LogOut,
    Wifi,
    WifiOff,
    ChevronDown,
    Sun,
    Moon,
    Check,
    User,
    Settings
} from 'lucide-react'
import { signOut } from 'next-auth/react' // Client-side signOut
import { Button } from '@/components/ui/button' // We might need to create this or use raw HTML
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useLanguage } from '@/components/providers/language-provider'

interface User {
    name?: string | null
    email?: string | null
    role?: string
}

interface NavbarProps {
    user: User
    slug: string
}

export default function Navbar({ user, slug }: NavbarProps) {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const { theme, setTheme } = useTheme()
    const { language, setLanguage, t } = useLanguage()
    const isConnected = true // Mock for now

    const roleColors: Record<string, string> = {
        mesero: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        cocinero: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
        facturero: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        cajero: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        admin: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    }

    const roleName = user.role || 'Usuario'

    const toggleLanguage = () => {
        setLanguage(language === 'es' ? 'en' : 'es')
        setIsUserMenuOpen(false) // Close menu after selection
    }

    return (
        <nav className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 flex items-center shadow-sm">
            <div className="max-w-[1600px] w-full mx-auto px-4 flex justify-between items-center">
                {/* Left Side: Brand & Status */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-500">
                            <UtensilsCrossed size={18} />
                        </div>
                        <h1 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight hidden sm:block">
                            Restaurante
                        </h1>
                    </div>

                    <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${isConnected
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                            }`}
                    >
                        {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                        <span className="hidden sm:inline">{isConnected ? t('nav.online') : t('nav.offline')}</span>
                    </div>
                </div>

                {/* Right Side: Role & User Menu */}
                <div className="flex items-center gap-3">
                    {/* Role Badge */}
                    <span
                        className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide hidden md:block ${roleColors[roleName] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                    >
                        {roleName}
                    </span>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 rounded-xl transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-semibold text-sm">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block">
                                {user.name || 'Usuario'}
                            </span>
                            <ChevronDown
                                size={16}
                                className={`text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {isUserMenuOpen && (
                            <div
                                className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right"
                            >
                                <div className="flex items-center gap-3 p-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                                    <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-lg">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-slate-800 dark:text-white text-sm">{user.name}</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1 py-1">
                                    <Link
                                        href={`/${slug}/settings`}
                                        className="flex items-center gap-2 w-full p-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-left"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        <Settings size={16} />
                                        {t('nav.settings')}
                                    </Link>

                                    {/* Theme Toggle */}
                                    <button
                                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                        className="flex items-center justify-between w-full p-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-left"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Sun size={16} className="dark:hidden" />
                                            <Moon size={16} className="hidden dark:block" />
                                            <span>{t('nav.theme')}</span>
                                        </div>
                                        <span className="text-xs text-slate-400">
                                            <span className="dark:hidden">{t('nav.light')}</span>
                                            <span className="hidden dark:inline">{t('nav.dark')}</span>
                                        </span>
                                    </button>

                                    {/* Language Toggle */}
                                    <button
                                        onClick={toggleLanguage}
                                        className="flex items-center justify-between w-full p-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-left"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-base">🌐</span>
                                            <span>{t('nav.language')}</span>
                                        </div>
                                        <span className="text-xs text-slate-400 uppercase font-bold">
                                            {language}
                                        </span>
                                    </button>
                                </div>

                                <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/login' })}
                                        className="flex w-full items-center gap-2 p-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                                    >
                                        <LogOut size={16} />
                                        <span>{t('nav.logout')}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
