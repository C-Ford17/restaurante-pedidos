import { X, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useLanguage } from '@/components/providers/language-provider'

interface Transaction {
    paymentMethod: string
    amount: number
}

interface OrderDetail {
    id: string
    tableNumber: number
    waiterName: string
    total: number
    transactions: Transaction[]
    createdAt: string
}

interface PaymentModalProps {
    isOpen: boolean
    onClose: () => void
    method: string | null
    orders: OrderDetail[]
}

export default function PaymentModal({ isOpen, onClose, method, orders }: PaymentModalProps) {
    const { t } = useLanguage()

    if (!isOpen || !method) return null

    // Filter orders that have at least one transaction with the selected method
    const relevantOrders = orders.filter(o =>
        o.transactions.some(t => t.paymentMethod === method)
    )

    const totalForMethod = relevantOrders.reduce((acc, o) => {
        const trans = o.transactions.find(t => t.paymentMethod === method)
        return acc + (trans ? Number(trans.amount) : 0)
    }, 0)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 capitalize">
                            <DollarSign className="text-emerald-500" />
                            {method}
                        </h3>
                        <p className="text-sm text-slate-500">
                            {relevantOrders.length} {t('admin.payment.orders')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                                {t('admin.dashboard.table.total') || 'Total'} ({method})
                            </p>
                            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                                {formatCurrency(totalForMethod)}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left min-w-[600px]">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-2 py-3 whitespace-nowrap text-left">{t('admin.dashboard.table.time') || 'Time'}</th>
                                        <th className="px-2 py-3 whitespace-nowrap text-left">{t('admin.dashboard.table.table') || 'Table'}</th>
                                        <th className="px-2 py-3 whitespace-nowrap text-left">{t('admin.dashboard.table.staff') || 'Staff'}</th>
                                        <th className="px-2 py-3 whitespace-nowrap text-left">{t('admin.dashboard.table.total') || 'Total'}</th>
                                        <th className="px-2 py-3 whitespace-nowrap text-right">{t('admin.payment.amount')} ({method})</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {relevantOrders.map((order) => {
                                        const trans = order.transactions.find(t => t.paymentMethod === method)
                                        const amount = trans ? Number(trans.amount) : 0

                                        return (
                                            <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-2 py-3 text-slate-500 whitespace-nowrap">
                                                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-2 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                                    #{order.tableNumber}
                                                </td>
                                                <td className="px-2 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                    {order.waiterName}
                                                </td>
                                                <td className="px-2 py-3 text-slate-500 whitespace-nowrap">
                                                    {formatCurrency(order.total)}
                                                </td>
                                                <td className="px-2 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                                    {formatCurrency(amount)}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {relevantOrders.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-2 py-8 text-center text-slate-500">
                                                {t('admin.payment.empty')}
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
