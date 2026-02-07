'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/components/providers/language-provider'
import {
    BarChart3,
    RefreshCw,
    DollarSign,
    ShoppingBag,
    CheckCircle2,
    Coins,
    TrendingUp
} from 'lucide-react'

interface DashboardStats {
    totalSales: number
    ordersCount: number
    paidOrders: number
    tipsTotal: number
}

export default function AdminDashboardPage() {
    const { t } = useLanguage()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<DashboardStats>({
        totalSales: 0,
        ordersCount: 0,
        paidOrders: 0,
        tipsTotal: 0
    })

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/admin/dashboard')
            if (!response.ok) throw new Error('Failed to fetch dashboard data')
            const data = await response.json()
            setStats(data)
        } catch (error) {
            console.error('Error loading dashboard:', error)
            // Keep zeros on error or show notification
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(value)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <BarChart3 className="text-orange-600 dark:text-orange-400" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {t('admin.dashboard')}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t('admin.dashboard.subtitle')}
                        </p>
                    </div>
                </div>
                <button
                    onClick={loadDashboardData}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    <span className="text-sm font-medium">{t('admin.refresh')}</span>
                </button>
            </div>

            {/* Stats Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse">
                            <div className="h-12 w-12 bg-slate-200 dark:bg-slate-800 rounded-lg mb-4" />
                            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Sales */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <DollarSign className="text-green-600 dark:text-green-400" size={24} />
                            </div>
                            <div className="flex-1">
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {formatCurrency(stats.totalSales)}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {t('admin.stats.totalSales')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Orders Count */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <ShoppingBag className="text-blue-600 dark:text-blue-400" size={24} />
                            </div>
                            <div className="flex-1">
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats.ordersCount}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {t('admin.stats.orders')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Paid Orders */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={24} />
                            </div>
                            <div className="flex-1">
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats.paidOrders}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {t('admin.stats.paidOrders')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow cursor-pointer hover:border-orange-600">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <Coins className="text-amber-600 dark:text-amber-400" size={24} />
                            </div>
                            <div className="flex-1">
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {formatCurrency(stats.tipsTotal)}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {t('admin.stats.tips')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Coming Soon Sections */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800">
                <div className="text-center">
                    <TrendingUp className="mx-auto text-slate-400 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        {t('admin.dashboard.comingSoon')}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                        {t('admin.dashboard.comingSoonDesc')}
                    </p>
                </div>
            </div>
        </div>
    )
}
