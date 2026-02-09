import { X, User } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useLanguage } from '@/components/providers/language-provider'

interface TipsBreakdown {
    totalTips: number
    ordersWithTips: number
    averageTip: number
    byWaiter: {
        waiterName: string
        totalTips: number
        ordersCount: number
    }[]
}

interface TipsModalProps {
    isOpen: boolean
    onClose: () => void
    data: TipsBreakdown
}

export default function TipsModal({ isOpen, onClose, data }: TipsModalProps) {
    const { t } = useLanguage()

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {t('admin.stats.tips') || 'Tips Report'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
                            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">{t('admin.tips.total')}</p>
                            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                                {formatCurrency(data.totalTips)}
                            </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('admin.tips.orders_with')}</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {data.ordersWithTips}
                            </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('admin.tips.average')}</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {formatCurrency(data.averageTip)}
                            </p>
                        </div>
                    </div>

                    {/* Breakdown by Waiter */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                            <User size={18} />
                            {t('admin.tips.breakdown')}
                        </h4>

                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-xs font-semibold">
                                    <tr>
                                        <th className="px-3 py-3 w-1/3">{t('admin.tips.waiter')}</th>
                                        <th className="px-2 py-3 text-center w-1/3">{t('admin.tips.orders_count')}</th>
                                        <th className="px-3 py-3 text-right w-1/3">{t('admin.tips.amount')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {data.byWaiter.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-3 py-3 font-medium text-slate-900 dark:text-white truncate max-w-[120px]">
                                                {item.waiterName}
                                            </td>
                                            <td className="px-2 py-3 text-center text-slate-600 dark:text-slate-400">
                                                {item.ordersCount}
                                            </td>
                                            <td className="px-3 py-3 text-right font-semibold text-slate-900 dark:text-white">
                                                {formatCurrency(item.totalTips)}
                                            </td>
                                        </tr>
                                    ))}
                                    {data.byWaiter.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                                                {t('admin.tips.no_data')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
