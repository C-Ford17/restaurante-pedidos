'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
    Utensils,
    QrCode,
    ExternalLink,
    Users,
    Loader2,
    ChevronLeft
} from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'
import QRModal from '@/components/staff/QRModal'

interface Table {
    id: string
    number: number
    capacity: number
    status: string
}

export default function StaffTablesPage() {
    const { t } = useLanguage()
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string

    const { data: session } = useSession()
    const [loading, setLoading] = useState(true)
    const [tables, setTables] = useState<Table[]>([])

    // QR Modal State
    const [isQRModalOpen, setIsQRModalOpen] = useState(false)
    const [selectedQR, setSelectedQR] = useState<{ title: string, url: string, subtitle?: string } | null>(null)

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const res = await fetch('/api/tables')
                if (res.ok) {
                    const data = await res.json()
                    setTables(data.sort((a: Table, b: Table) => a.number - b.number))
                }
            } catch (error) {
                console.error('Error fetching tables:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchTables()
    }, [])

    const openTableQR = (table: Table) => {
        const url = `${window.location.origin}/${slug}/mesa/${table.number}`
        setSelectedQR({
            title: `${t('common.table')} ${table.number}`,
            url,
            subtitle: t('staff.tables.scan_instruction')
        })
        setIsQRModalOpen(true)
    }

    const openMenuQR = () => {
        const url = `${window.location.origin}/${slug}/menu`
        setSelectedQR({
            title: t('staff.tables.menu_qr'),
            url,
            subtitle: t('staff.tables.scan_instruction')
        })
        setIsQRModalOpen(true)
    }

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center">
                <Loader2 className="animate-spin text-orange-600" size={48} />
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    {session?.user?.role === 'mesero' && (
                        <button
                            onClick={() => router.push(`/${slug}/waiter`)}
                            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                            title={t('common.back')}
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            <Utensils className="text-orange-600" size={32} />
                            {t('staff.tables.title')}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {tables.map(table => (
                    <div
                        key={table.id}
                        className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-6 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group"
                    >
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    {t('common.table')}
                                </span>
                                <h3 className="text-4xl font-black text-slate-900 dark:text-white">
                                    {table.number}
                                </h3>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-xl flex items-center gap-2 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                                <Users size={16} />
                                <span className="font-bold">{table.capacity}</span>
                            </div>
                        </div>

                        <div
                            className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl h-32 flex flex-col items-center justify-center gap-2 cursor-pointer group-hover:bg-orange-50 dark:group-hover:bg-orange-950/20 transition-colors"
                            onClick={() => openTableQR(table)}
                        >
                            <QrCode size={40} className="text-slate-300 dark:text-slate-600 group-hover:text-orange-500 transition-colors" />
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 group-hover:text-orange-600">
                                {t('staff.tables.view_qr')}
                            </span>
                        </div>

                        <div className="w-full">
                            <a
                                href={`/${slug}/mesa/${table.number}/status`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-4 px-4 bg-orange-600/10 text-orange-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                            >
                                <ExternalLink size={18} />
                                {t('staff.tables.view_table')}
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {tables.length === 0 && !loading && (
                <div className="py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Utensils size={40} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No se encontraron mesas</h3>
                </div>
            )}

            {/* QR Modal */}
            <QRModal
                isOpen={isQRModalOpen}
                onClose={() => setIsQRModalOpen(false)}
                title={selectedQR?.title || ''}
                url={selectedQR?.url || ''}
                subtitle={selectedQR?.subtitle}
            />
        </div>
    )
}
