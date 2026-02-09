import { useLanguage } from '@/components/providers/language-provider'
import { Clock, Users, DollarSign, Receipt, ArrowRight } from 'lucide-react'

interface CashierOrderListProps {
    orders: any[]
    onPaymentClick: (order: any) => void
    onViewBillClick: (order: any) => void
}

export const CashierOrderList: React.FC<CashierOrderListProps> = ({ orders, onPaymentClick, onViewBillClick }) => {
    const { t } = useLanguage()

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Receipt size={64} className="mb-4 opacity-50" />
                <p className="text-lg">{t('cashier.no_orders') || 'No hay pedidos activos'}</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {orders.map((order) => {
                const isReadyToPay = order.status === 'listo_pagar'
                const isPartiallyPaid = order.totalPaid > 0
                const isFullyPaid = order.remaining <= 0

                return (
                    <div
                        key={order.id}
                        className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border transition-all hover:shadow-md ${isReadyToPay
                            ? 'border-orange-200 dark:border-orange-900/50 ring-1 ring-orange-100 dark:ring-orange-900/20'
                            : 'border-slate-200 dark:border-slate-800'
                            }`}
                    >
                        {/* Card Header */}
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                            <div>
                                <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-lg font-bold text-slate-900 dark:text-white mb-2">
                                    {t('common.table')} {order.tableNumber}
                                </span>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Clock size={12} />
                                    <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    {order.waiter && (
                                        <>
                                            <span>•</span>
                                            <Users size={12} />
                                            <span>{order.waiter.name}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isReadyToPay
                                ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}>
                                {t(`status.${order.status}`) || order.status}
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-slate-500 text-sm">{t('cashier.total')}</span>
                                <span className="text-2xl font-black text-slate-900 dark:text-white">
                                    ${order.total.toLocaleString()}
                                </span>
                            </div>

                            {isPartiallyPaid && (
                                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg space-y-1">
                                    <div className="flex justify-between text-xs text-green-700 dark:text-green-300">
                                        <span>{t('cashier.paid')}</span>
                                        <span className="font-bold">${order.totalPaid.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold text-orange-600 dark:text-orange-400">
                                        <span>{t('cashier.remaining')}</span>
                                        <span>${order.remaining.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Card Footer */}
                        <div className="p-4 pt-0">
                            {order.status === 'pagado' ? (
                                <button
                                    onClick={() => onPaymentClick(order)} // Still open modal to view/print
                                    className="w-full py-3 bg-green-100 text-green-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-200 transition-colors"
                                >
                                    <Receipt size={18} />
                                    {t('cashier.view_receipt') || 'Ver Recibo'}
                                </button>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => onViewBillClick(order)} // Redirect to bill page
                                        className="col-span-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        <Receipt size={18} />
                                        {t('cashier.bill') || 'Cuenta'}
                                    </button>
                                    <button
                                        onClick={() => onPaymentClick(order)}
                                        className={`col-span-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-white shadow-lg shadow-orange-600/20 ${isReadyToPay
                                            ? 'bg-orange-600 hover:bg-orange-700'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                    >
                                        <DollarSign size={18} />
                                        {isReadyToPay ? (t('cashier.pay') || 'Cobrar') : (t('cashier.prepay') || 'Adelanto')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
