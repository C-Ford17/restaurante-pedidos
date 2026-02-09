'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useLanguage } from '@/components/providers/language-provider'
import {
    UtensilsCrossed,
    ChevronRight,
    Clock,
    Info,
    Loader2,
    AlertCircle,
    Image as ImageIcon
} from 'lucide-react'
import { Container } from '@/components/ui/container'
import { FloatingToggles } from '@/components/common/FloatingToggles'

interface MenuItem {
    id: string
    name: string
    price: number
    description: string | null
    imageUrl: string | null
    category: string
    estimatedTime: number | null
}

interface Organization {
    id: string
    name: string
}

export default function PublicMenuPage() {
    const { t } = useLanguage()
    const params = useParams()
    const slug = params.slug as string

    const [loading, setLoading] = useState(true)
    const [organization, setOrganization] = useState<Organization | null>(null)
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [orgRes, menuRes] = await Promise.all([
                    fetch(`/api/public/organization?slug=${slug}`),
                    fetch(`/api/public/organization/menu?slug=${slug}`)
                ])

                if (!orgRes.ok) throw new Error('Organization not found')
                if (!menuRes.ok) throw new Error('Failed to fetch menu')

                const orgData = await orgRes.json()
                const menuData = await menuRes.json()

                setOrganization(orgData)
                setMenuItems(menuData.items)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [slug])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-orange-600" size={48} />
                    <p className="text-slate-500 font-medium animate-pulse">{t('waiter.loading')}</p>
                </div>
            </div>
        )
    }

    if (error || !organization) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
                <div className="text-center space-y-4 max-w-md bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Error</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        No pudimos encontrar el restaurante solicitado.
                    </p>
                </div>
            </div>
        )
    }

    // Group items by category
    const groupedMenu = menuItems.reduce((acc, item) => {
        const cat = item.category || 'Varios'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(item)
        return acc
    }, {} as Record<string, MenuItem[]>)

    const categories = Object.keys(groupedMenu)

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            {/* Header / Hero */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-all duration-300">
                <Container>
                    <div className="h-20 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-600/30">
                                <UtensilsCrossed size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                    {organization.name}
                                </h1>
                                <p className="text-[10px] text-orange-600 font-black uppercase tracking-[0.2em] mt-0.5">
                                    Menú Digital
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Category Nav */}
                    <div className="pb-4 overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-2">
                        {categories.map((cat) => (
                            <a
                                key={cat}
                                href={`#${cat}`}
                                className="whitespace-nowrap px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                            >
                                {cat}
                            </a>
                        ))}
                    </div>
                </Container>
            </div>

            {/* Content */}
            <main className="py-8 pb-20">
                <Container>
                    <div className="space-y-16">
                        {categories.map((cat) => (
                            <section key={cat} id={cat} className="scroll-mt-32 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="flex items-center gap-4 relative">
                                    <div className="w-2 h-10 bg-orange-600 rounded-full skiptranslate" />
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                        {cat}
                                    </h2>
                                    <div className="flex-1 border-t-2 border-slate-200 dark:border-slate-800 mt-1 skiptranslate" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {groupedMenu[cat].map((item) => (
                                        <div
                                            key={item.id}
                                            className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 flex flex-col h-full shadow-sm"
                                        >
                                            {/* Image */}
                                            <div className="relative h-56 overflow-hidden">
                                                {item.imageUrl ? (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 gap-2 skiptranslate">
                                                        <ImageIcon size={48} />
                                                        <span className="text-xs font-bold uppercase tracking-widest">{t('admin.menu.noDescription')}</span>
                                                    </div>
                                                )}

                                                {/* Price Badge */}
                                                <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-xl skiptranslate">
                                                    <span className="text-lg font-black text-orange-600">
                                                        ${parseFloat(item.price.toString()).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className="p-6 flex flex-col flex-1 gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                                                            {item.name}
                                                        </h3>
                                                    </div>

                                                    {item.description && (
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed h-10">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="mt-auto flex items-center justify-between text-slate-400 dark:text-slate-500">
                                                    {item.estimatedTime ? (
                                                        <div className="flex items-center gap-1.5 text-xs font-bold skiptranslate">
                                                            <Clock size={16} className="text-orange-500" />
                                                            <span>{item.estimatedTime} min</span>
                                                        </div>
                                                    ) : (
                                                        <div />
                                                    )}

                                                    <div className="px-3 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-100 dark:border-slate-700">
                                                        {item.category}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </Container>
            </main>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <Container>
                    <div className="flex flex-col items-center justify-center gap-6">
                        <div className="flex items-center gap-3">
                            <UtensilsCrossed className="text-orange-600" size={32} />
                            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Hamelin Foods</span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium text-center">
                            © {new Date().getFullYear()} {organization.name}. Todos los derechos reservados.
                        </p>
                    </div>
                </Container>
            </footer>

            {/* Mobile Fab to categories */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden skiptranslate">
                <button
                    onClick={() => {
                        const first = document.querySelector('section');
                        if (first) first.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full font-black text-sm shadow-2xl flex items-center gap-2 border border-white/10 dark:border-slate-800/10"
                >
                    <ChevronRight size={18} className="-rotate-90" />
                    Menú
                </button>
            </div>

            <FloatingToggles />
        </div>
    )
}
