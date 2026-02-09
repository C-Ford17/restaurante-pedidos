'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { useLanguage } from '@/components/providers/language-provider'
import {
    BarChart3,
    UtensilsCrossed,
    Package,
    Settings,
    Menu,
    X
} from 'lucide-react'

interface AdminLayoutProps {
    children: React.ReactNode
    params: Promise<{ slug: string }>
}

export default function AdminLayout({ children, params }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()
    const { t } = useLanguage()
    const urlParams = useParams()
    const slug = urlParams?.slug as string

    const navigation = [
        {
            name: t('admin.dashboard'),
            href: `/${slug}/admin/dashboard`,
            icon: BarChart3
        },
        {
            name: t('admin.menu'),
            href: `/${slug}/admin/menu`,
            icon: UtensilsCrossed
        },
        {
            name: t('admin.inventory'),
            href: `/${slug}/admin/inventory`,
            icon: Package
        },
        {
            name: t('admin.settings'),
            href: `/${slug}/admin/settings`,
            icon: Settings
        }
    ]

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
            {/* Hamburger Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`fixed left-4 top-20 z-50 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg text-slate-600 dark:text-slate-400 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all ${sidebarOpen ? 'left-64' : ''
                    }`}
            >
                <Menu size={20} />
            </button>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-16 bottom-0 w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-500">
                                <Settings size={20} />
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">Admin</span>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="md:hidden p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname?.includes(item.href)
                            const Icon = item.icon

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                        ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span>{item.name}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 pt-24 md:ml-0">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
