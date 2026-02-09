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
    TrendingUp,
    LayoutGrid,
    UtensilsCrossed,
    Clock,
    FileText,
    Download,
    Eye,
    Trash2
} from 'lucide-react'
import DateRangePicker from '@/components/admin/date-range-picker'
import TipsModal from '@/components/admin/tips-modal'
import clsx from 'clsx'
import { formatCurrency } from '@/lib/utils'
import PaymentModal from '@/components/admin/payment-modal'
import OrderDetailModal from '@/components/admin/order-detail-modal'
import ConfirmationModal from '@/components/ui/confirmation-modal'

interface DashboardData {
    stats: {
        totalSales: number
        ordersCount: number
        paidOrders: number
        tipsTotal: number
    }
    salesHistory: { date: string; total: number }[]
    paymentMethods: { method: string; total: number; count: number }[]
    tipsBreakdown: {
        totalTips: number
        ordersWithTips: number
        averageTip: number
        byWaiter: { waiterName: string; totalTips: number; ordersCount: number }[]
    }
    topItems: { name: string; category: string; quantity: number; total: number; price: number }[]
    salesByDish: { name: string; category: string; quantity: number; total: number; price: number }[]
    kitchenStats: { name: string; category: string; totalPreparations: number; avgTime: number; minTime: number; maxTime: number }[]
    recentOrders: any[]
    allPaidOrders: any[]
}

const TABS = [
    { id: 'overview', label: 'admin.dashboard.overview', icon: LayoutGrid },
    { id: 'sales', label: 'admin.dashboard.sales', icon: DollarSign },
    { id: 'products', label: 'admin.dashboard.products', icon: UtensilsCrossed },
    { id: 'kitchen', label: 'admin.dashboard.kitchen', icon: Clock },
]

export default function AdminDashboardPage() {
    const { t } = useLanguage()
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')
    const [tipsModalOpen, setTipsModalOpen] = useState(false)
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
    const [viewOrderId, setViewOrderId] = useState<string | null>(null)
    const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Dates
    // Dates (Local Time)
    const getTodayString = () => {
        // Get current day in Colombia (UTC-5)
        const d = new Date()
        const colDate = new Date(d.getTime() - (5 * 60 * 60 * 1000))
        return colDate.toISOString().split('T')[0]
    }

    const [startDate, setStartDate] = useState(getTodayString())
    const [endDate, setEndDate] = useState(getTodayString())

    const [data, setData] = useState<DashboardData | null>(null)

    useEffect(() => {
        loadDashboardData()
    }, [startDate, endDate]) // Reload when dates change

    const loadDashboardData = async () => {
        setLoading(true)
        try {
            const query = new URLSearchParams()
            if (startDate) query.append('startDate', startDate)
            if (endDate) query.append('endDate', endDate)

            const response = await fetch(`/api/admin/dashboard?${query.toString()}`)
            if (!response.ok) throw new Error('Failed to fetch dashboard data')
            const result = await response.json()
            setData(result)
        } catch (error) {
            console.error('Error loading dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteOrder = async () => {
        if (!deleteOrderId) return
        setIsDeleting(true)
        try {
            const res = await fetch(`/api/admin/orders/${deleteOrderId}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                // Remove from local state
                if (data) {
                    setData({
                        ...data,
                        recentOrders: data.recentOrders.filter(o => o.id !== deleteOrderId)
                    })
                }
                setDeleteOrderId(null)
            } else {
                alert('Error deleting order')
            }
        } catch (err) {
            console.error(err)
            alert('Error deleting order')
        } finally {
            setIsDeleting(false)
        }
    }

    if (!data && loading) {
        return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>
    }

    const stats = data?.stats || { totalSales: 0, ordersCount: 0, paidOrders: 0, tipsTotal: 0 }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

                <div className="flex flex-wrap items-center gap-3">
                    <DateRangePicker
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(s, e) => {
                            setStartDate(s)
                            setEndDate(e)
                        }}
                    />
                    <button
                        onClick={loadDashboardData}
                        disabled={loading}
                        className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 gap-6">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                            activeTab === tab.id
                                ? "border-orange-500 text-orange-600 dark:text-orange-400"
                                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        )}
                        title={t(tab.label) || tab.id.charAt(0).toUpperCase() + tab.id.slice(1)}
                    >
                        <tab.icon size={18} />
                        <span className="hidden md:inline">
                            {t(tab.label) || tab.id.charAt(0).toUpperCase() + tab.id.slice(1)}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {/* Stats Summary Cards (Visible on all tabs or just overview? Let's keep distinct content) */}
                {/* Actually, summary stats are good on Overview */}

                {activeTab === 'overview' && data && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                icon={DollarSign} label={t('admin.stats.totalSales')}
                                value={formatCurrency(stats.totalSales)} color="green"
                            />
                            <StatCard
                                icon={ShoppingBag} label={t('admin.stats.orders')}
                                value={stats.ordersCount} color="blue"
                            />
                            <StatCard
                                icon={CheckCircle2} label={t('admin.stats.paidOrders')}
                                value={stats.paidOrders} color="emerald"
                            />
                            <StatCard
                                icon={Coins} label={t('admin.stats.tips')}
                                value={formatCurrency(stats.tipsTotal)} color="amber"
                                onClick={() => setTipsModalOpen(true)}
                                actionIcon={Eye}
                            />
                        </div>

                        {/* Recent Orders & Payment Methods */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                                <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                                    <FileText size={18} />
                                    {t('admin.orders.recent') || 'Recent Orders'}
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left min-w-[500px]">
                                        <thead className="text-xs text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800">
                                            <tr>
                                                <th className="py-2 pl-2">{t('admin.dashboard.table.table') || 'Table'}</th>
                                                <th className="py-2">{t('admin.dashboard.table.total') || 'Total'}</th>
                                                <th className="py-2">{t('admin.dashboard.table.status') || 'Status'}</th>
                                                <th className="py-2">{t('admin.dashboard.table.time') || 'Time'}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.recentOrders.map(order => (
                                                <tr key={order.id} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="py-3 font-medium text-slate-900 dark:text-white">#{order.tableNumber}</td>
                                                    <td className="py-3 text-slate-900 dark:text-slate-200">{formatCurrency(order.total)}</td>
                                                    <td className="py-3">
                                                        <span className={clsx(
                                                            "px-2 py-1 rounded-full text-xs font-medium",
                                                            order.status === 'pagado' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                                                order.status === 'cancelado' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                                                    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                        )}>
                                                            {t('status.' + order.status)}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-slate-500 dark:text-slate-400">
                                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                </tr>
                                            ))}
                                            {data.recentOrders.length === 0 && (
                                                <tr><td colSpan={4} className="py-4 text-center text-slate-500">No recent orders</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                                <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                                    <UtensilsCrossed size={18} />
                                    {t('admin.payment_methods') || 'Payment Methods'}
                                </h3>
                                <div className="space-y-4 overflow-x-auto">
                                    {data.paymentMethods.map(method => (
                                        <div
                                            key={method.method}
                                            onClick={() => setSelectedPaymentMethod(method.method)}
                                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group min-w-[300px]"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:border-emerald-200 dark:group-hover:border-emerald-800 transition-colors">
                                                    {/* Icon placeholder logic could go here */}
                                                    <DollarSign size={14} className="text-slate-500 group-hover:text-emerald-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white capitalize group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                        {method.method}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {method.count} {t('admin.payment.transactions')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-slate-700 dark:text-slate-300">
                                                    {formatCurrency(method.total)}
                                                </p>
                                                <Eye size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    ))}
                                    {data.paymentMethods.length === 0 && (
                                        <div className="text-center text-slate-500 py-4">No payment data available</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'sales' && data && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Daily Sales Chart (Simple Bar) */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                            <h3 className="text-lg font-semibold mb-6 text-slate-900 dark:text-white">
                                {t('admin.sales.history') || 'Sales History (Daily)'}
                            </h3>

                            {data.salesHistory.length > 0 ? (
                                <div className="flex gap-4 h-64">
                                    {/* Y-Axis Labels */}
                                    <div className="flex flex-col justify-between text-xs text-slate-400 py-1 text-right min-w-[50px] font-medium font-mono">
                                        <span>{formatCurrency(Math.max(...data.salesHistory.map(d => d.total)) || 0)}</span>
                                        <span>{formatCurrency((Math.max(...data.salesHistory.map(d => d.total)) || 0) / 2)}</span>
                                        <span>{formatCurrency(0)}</span>
                                    </div>

                                    {/* Chart Area */}
                                    <div className="flex-1 relative border-l border-b border-slate-200 dark:border-slate-700">
                                        {/* Grid Lines */}
                                        <div className="absolute inset-x-0 top-0 h-px border-t border-dashed border-slate-100 dark:border-slate-800"></div>
                                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px border-t border-dashed border-slate-100 dark:border-slate-800"></div>

                                        {/* Columns container */}
                                        <div className="absolute inset-0 flex items-end justify-around px-2 md:px-6 pb-0 pt-2">
                                            {data.salesHistory.map((day) => {
                                                const maxSales = Math.max(...data.salesHistory.map(d => d.total))
                                                const heightPercentage = maxSales > 0 ? (day.total / maxSales) * 100 : 0

                                                return (
                                                    <div key={day.date} className="group relative flex flex-col justify-end items-center h-full w-full max-w-[60px]">
                                                        {/* Tooltip */}
                                                        <div className="opacity-0 group-hover:opacity-100 absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1.5 px-3 rounded shadow-lg whitespace-nowrap z-20 pointer-events-none transition-all duration-200">
                                                            <div className="font-bold">{formatCurrency(day.total)}</div>
                                                            <div className="text-[10px] text-slate-300">
                                                                {new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                                                            </div>
                                                            {/* Arrow */}
                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                                                        </div>

                                                        {/* Bar */}
                                                        <div
                                                            className="w-full mx-1 bg-orange-500 dark:bg-orange-600 rounded-t opacity-90 group-hover:opacity-100 hover:shadow-lg hover:bg-orange-400 transition-all duration-300 relative"
                                                            style={{ height: `${Math.max(heightPercentage, 1)}%` }}
                                                        >
                                                        </div>

                                                        {/* X-Axis Label */}
                                                        <span className="absolute top-full mt-3 text-[10px] text-slate-400 truncate w-full text-center font-medium">
                                                            {new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }).replace('.', '')}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    No sales data available
                                </div>
                            )}
                        </div>

                        {/* Full Orders List */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    {t('admin.orders.all') || 'Daily Orders'}
                                </h3>
                                <div className="text-sm text-slate-500">
                                    Total: {data.recentOrders.length}
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left min-w-full md:min-w-[600px]">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="px-2 py-3 whitespace-nowrap hidden sm:table-cell">{t('admin.dashboard.table.time') || 'Time'}</th>
                                                <th className="px-2 py-3 whitespace-nowrap hidden sm:table-cell">{t('admin.dashboard.table.table') || 'Table'}</th>
                                                <th className="px-2 py-3 whitespace-nowrap hidden md:table-cell">{t('admin.dashboard.table.staff') || 'Staff'}</th>
                                                <th className="px-2 py-3 whitespace-nowrap hidden lg:table-cell">{t('admin.dashboard.table.items') || 'Items'}</th>
                                                <th className="px-2 py-3 whitespace-nowrap">{t('admin.dashboard.table.total') || 'Total'}</th>
                                                <th className="px-2 py-3 whitespace-nowrap">{t('admin.dashboard.table.status') || 'Status'}</th>
                                                <th className="px-2 py-3 whitespace-nowrap text-right">{t('admin.dashboard.table.actions') || 'Actions'}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {data.recentOrders.map(order => (
                                                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-2 py-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap hidden sm:table-cell">
                                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="px-2 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap hidden sm:table-cell">#{order.tableNumber}</td>
                                                    <td className="px-2 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap hidden md:table-cell">{order.waiterName}</td>
                                                    <td className="px-2 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap hidden lg:table-cell">{order.itemCount}</td>
                                                    <td className="px-2 py-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                                                        {formatCurrency(order.total)}
                                                    </td>
                                                    <td className="px-2 py-3 whitespace-nowrap">
                                                        <span className={clsx(
                                                            "px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider",
                                                            order.status === 'pagado' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                                                order.status === 'cancelado' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                                                    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                        )}>
                                                            {t('status.' + order.status) || order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 py-3 text-right whitespace-nowrap">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => setViewOrderId(order.id)}
                                                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                                title={t('common.view')}
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteOrderId(order.id)}
                                                                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                title={t('common.delete')}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && data && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Top Items Sections */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Top Selling (Qty) */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                                <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                                    <TrendingUp size={18} />
                                    {t('admin.top_items') || 'Top Selling Items (Qty)'}
                                </h3>
                                <div className="space-y-4">
                                    {data.topItems.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-slate-900 dark:text-white">{item.name}</h4>
                                                <p className="text-xs text-slate-500">{item.category}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-900 dark:text-white">{item.quantity} sold</p>
                                                <p className="text-xs text-slate-500">{formatCurrency(item.total)}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {data.topItems.length === 0 && <div className="text-center text-slate-500 py-4">No sales data</div>}
                                </div>
                            </div>

                            {/* Sales by Dish (Revenue) */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                                <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                                    <DollarSign size={18} />
                                    {t('admin.sales_by_dish') || 'Revenue by Dish'}
                                </h3>
                                <div className="space-y-4">
                                    {data.salesByDish.slice(0, 10).map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center font-bold text-sm">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-slate-900 dark:text-white">{item.name}</h4>
                                                <p className="text-xs text-slate-500">{item.category}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(item.total)}</p>
                                                <p className="text-xs text-slate-500">{item.quantity} units</p>
                                            </div>
                                        </div>
                                    ))}
                                    {data.salesByDish.length === 0 && <div className="text-center text-slate-500 py-4">No sales data</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'kitchen' && data && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                            <h3 className="text-lg font-semibold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                                <Clock size={18} />
                                {t('admin.kitchen_stats') || 'Kitchen Performance'}
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left min-w-[700px]">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-lg">{t('admin.kitchen.item') || 'Item'}</th>
                                            <th className="px-4 py-3">{t('admin.kitchen.category') || 'Category'}</th>
                                            <th className="px-4 py-3 text-center">{t('admin.kitchen.preparations') || 'Preparations'}</th>
                                            <th className="px-4 py-3 text-center">{t('admin.kitchen.avg_time') || 'Avg Time'}</th>
                                            <th className="px-4 py-3 text-center rounded-r-lg">{t('admin.kitchen.min_max') || 'Min / Max'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.kitchenStats.map((stat, idx) => (
                                            <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                                                    {stat.name}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">
                                                        {stat.category}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center font-bold text-slate-900 dark:text-white">
                                                    {stat.totalPreparations}
                                                </td>
                                                <td className="px-4 py-3 text-center font-bold text-slate-700 dark:text-slate-300">
                                                    {Math.round(stat.avgTime)} min
                                                </td>
                                                <td className="px-4 py-3 text-center text-xs text-slate-500">
                                                    {stat.minTime}m / {stat.maxTime}m
                                                </td>
                                            </tr>
                                        ))}
                                        {data.kitchenStats.length === 0 && (
                                            <tr><td colSpan={5} className="py-8 text-center text-slate-500">No kitchen performance data available</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <TipsModal
                isOpen={tipsModalOpen}
                onClose={() => setTipsModalOpen(false)}
                data={data?.tipsBreakdown || { totalTips: 0, ordersWithTips: 0, averageTip: 0, byWaiter: [] }}
            />

            <PaymentModal
                isOpen={!!selectedPaymentMethod}
                onClose={() => setSelectedPaymentMethod(null)}
                method={selectedPaymentMethod}
                orders={data?.allPaidOrders || []}
            />

            <OrderDetailModal
                isOpen={!!viewOrderId}
                onClose={() => setViewOrderId(null)}
                orderId={viewOrderId}
            />

            <ConfirmationModal
                isOpen={!!deleteOrderId}
                onClose={() => setDeleteOrderId(null)}
                onConfirm={handleDeleteOrder}
                title={t('common.delete')}
                message={t('order_detail.delete_confirm')}
                confirmText={t('common.delete')}
                isDestructive={true}
                isLoading={isDeleting}
            />
        </div>
    )
}

function StatCard({ icon: Icon, label, value, color, onClick, actionIcon: ActionIcon }: {
    icon: any,
    label: string,
    value: string | number,
    color: string,
    onClick?: () => void,
    actionIcon?: any
}) {
    const colorClasses: Record<string, string> = {
        green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
        blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
        emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
        amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    }

    return (
        <div
            onClick={onClick}
            className={clsx(
                "bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all",
                onClick && "cursor-pointer group active:scale-95"
            )}
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
                    <Icon size={24} />
                </div>
                <div className="flex-1">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {value}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-between">
                        {label}
                        {onClick && ActionIcon && (
                            <ActionIcon size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
