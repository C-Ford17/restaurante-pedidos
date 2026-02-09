'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle2, ChevronRight, DollarSign, CreditCard, Banknote, Smartphone, Printer } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'

interface PaymentModalProps {
    order: any
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    slug: string
    defaultTipPercentage: number
    paymentMethods: any[]
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    order,
    isOpen,
    onClose,
    onSuccess,
    slug,
    defaultTipPercentage,
    paymentMethods = []
}) => {
    const { t } = useLanguage()

    // Modes: 'amount' (arbitrary split) or 'items' (select items)
    const [mode, setMode] = useState<'amount' | 'items'>('amount')

    // Core payment state
    // Core payment state
    const [amountToPay, setAmountToPay] = useState<string>('') // For 'amount' mode
    // Map of itemId -> quantity to pay
    const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map())

    // Tip state
    const [tipMode, setTipMode] = useState<'none' | 'percent' | 'custom'>('percent')
    const [tipPercent, setTipPercent] = useState<number>(defaultTipPercentage)
    const [customTipAmount, setCustomTipAmount] = useState<string>('')

    const [paymentMethod, setPaymentMethod] = useState<string>('')
    const [manualAmountReceived, setManualAmountReceived] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Derived values
    const remainingBalance = order.remaining
    const items = order.items || []

    const selectedMethodObj = paymentMethods.find(m => m.name === paymentMethod)
    const isPhysical = selectedMethodObj ? !selectedMethodObj.isDigital : false

    // Filter unpaid items
    const unpaidItems = items.filter((item: any) => !item.transactionId)

    // Calculate subtotal for full balance (to help with change calculation)
    const fullBalanceSubtotal = remainingBalance
    const fullBalanceTip = tipMode === 'none' ? 0
        : tipMode === 'percent' ? fullBalanceSubtotal * (tipPercent / 100)
            : Number(customTipAmount) || 0
    const fullBalanceTotal = fullBalanceSubtotal + fullBalanceTip

    // Calculate subtotal based on mode
    let currentSubtotal = 0
    let change = 0

    if (mode === 'items') {
        currentSubtotal = Array.from(selectedItems.entries()).reduce((acc, [id, qty]) => {
            const item = unpaidItems.find((i: any) => i.id === id)
            return acc + (item ? Number(item.unitPrice) * qty : 0)
        }, 0)
    } else {
        const inputAmount = Number(amountToPay) || 0
        if (isPhysical && mode === 'amount') {
            // Logic for cash/physical payments
            if (inputAmount >= fullBalanceTotal) {
                currentSubtotal = fullBalanceSubtotal
                change = inputAmount - fullBalanceTotal
            } else {
                currentSubtotal = inputAmount
                change = 0
            }
        } else {
            currentSubtotal = inputAmount
        }
    }

    // Calculate tip
    const currentTip = tipMode === 'none' ? 0
        : tipMode === 'percent' ? currentSubtotal * (tipPercent / 100)
            : Number(customTipAmount) || 0

    const totalToCharge = currentSubtotal + currentTip

    // Handlers
    // Initialize default payment method
    useEffect(() => {
        if (paymentMethods.length > 0 && !paymentMethod) {
            setPaymentMethod(paymentMethods[0].name)
        }
    }, [paymentMethods, paymentMethod])

    // Handlers
    const toggleItemSelection = (itemId: string, maxQty: number) => {
        setSelectedItems(prev => {
            const newMap = new Map(prev)
            if (newMap.has(itemId)) {
                newMap.delete(itemId)
            } else {
                newMap.set(itemId, maxQty) // Select all by default
            }
            return newMap
        })
    }

    const updateItemQuantity = (itemId: string, qty: number) => {
        setSelectedItems(prev => {
            const newMap = new Map(prev)
            if (qty <= 0) {
                newMap.delete(itemId)
            } else {
                newMap.set(itemId, qty)
            }
            return newMap
        })
    }

    const selectAllItems = () => {
        if (selectedItems.size === unpaidItems.length) {
            setSelectedItems(new Map())
        } else {
            const newMap = new Map()
            unpaidItems.forEach((item: any) => {
                newMap.set(item.id, item.quantity)
            })
            setSelectedItems(newMap)
        }
    }

    const handlePay = async () => {
        if (currentSubtotal <= 0) return

        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/cashier/orders/${order.id}/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: currentSubtotal,
                    tipAmount: currentTip,
                    paymentMethod,
                    items: mode === 'items'
                        ? Array.from(selectedItems.entries()).map(([id, quantity]) => ({ id, quantity }))
                        : undefined
                })
            })

            if (res.ok) {
                onSuccess()
            } else {
                console.error('Payment failed')
            }
        } catch (error) {
            console.error('Error paying:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handlePrint = () => {
        // Open receipt in new window, passing current tip
        const url = `/${slug}/receipt/${order.id}?tip=${currentTip}`
        window.open(url, '_blank', 'width=400,height=600')
    }

    useEffect(() => {
        // Initialize amount to remaining balance
        if (mode === 'amount') {
            setAmountToPay(remainingBalance.toString())
        }
    }, [mode, remainingBalance])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{t('cashier.payment_for')}</span>
                            <span className="text-orange-600">#{order.tableNumber}</span>
                        </h2>
                        <p className="text-sm text-slate-500">Total: ${order.total.toLocaleString()} • {t('cashier.remaining')}: ${remainingBalance.toLocaleString()}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Payment Mode Selection */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button
                            onClick={() => setMode('amount')}
                            className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${mode === 'amount'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                }`}
                        >
                            {t('cashier.pay_amount') || 'Monto Libre'}
                        </button>
                        <button
                            onClick={() => setMode('items')}
                            className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${mode === 'items'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                }`}
                        >
                            {t('cashier.pay_items') || 'Pagar Items'}
                        </button>
                    </div>

                    {/* Mode Content */}
                    <div className="min-h-[120px]">
                        {mode === 'amount' ? (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {isPhysical ? (t('cashier.amount_received') || 'Monto recibido') : (t('cashier.enter_amount') || 'Monto a pagar')}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        value={amountToPay}
                                        onChange={(e) => setAmountToPay(e.target.value)}
                                        className="w-full pl-10 pr-4 py-4 text-3xl font-bold bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white"
                                        placeholder="0"
                                    />
                                    {isPhysical && change > 0 && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end">
                                            <span className="text-[10px] uppercase font-black text-orange-600 leading-none mb-1">{t('cashier.change')}</span>
                                            <span className="text-xl font-black text-orange-600 leading-none">${change.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Max: ${remainingBalance.toLocaleString()}</span>
                                    <button onClick={() => setAmountToPay(remainingBalance.toString())} className="text-orange-600 font-bold hover:underline">
                                        {t('cashier.pay_full') || 'Pagar Todo'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {t('cashier.select_items') || 'Seleccionar items'}
                                    </label>
                                    <button onClick={selectAllItems} className="text-xs font-bold text-orange-600 hover:underline">
                                        {selectedItems.size === unpaidItems.length ? (t('common.deselect_all') || 'Deseleccionar') : (t('common.select_all') || 'Seleccionar Todo')}
                                    </button>
                                </div>
                                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-[200px] overflow-y-auto">
                                    {unpaidItems.length === 0 ? (
                                        <div className="p-4 text-center text-slate-400 text-sm">{t('cashier.no_unpaid_items') || 'No hay items pendientes'}</div>
                                    ) : unpaidItems.map((item: any) => {
                                        const isSelected = selectedItems.has(item.id)
                                        const selectedQty = selectedItems.get(item.id) || 0

                                        return (
                                            <div
                                                key={item.id}
                                                className={`p-4 flex justify-between items-center transition-colors border-b border-slate-50 last:border-0 ${isSelected
                                                    ? 'bg-orange-50/50 dark:bg-orange-900/10'
                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div
                                                        onClick={() => toggleItemSelection(item.id, item.quantity)}
                                                        className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer ${isSelected
                                                            ? 'bg-orange-600 border-orange-600 text-white'
                                                            : 'border-slate-300 dark:border-slate-600'
                                                            }`}>
                                                        {isSelected && <CheckCircle2 size={12} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item.menuItem.name}</span>
                                                            {item.quantity > 1 && isSelected && (
                                                                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 px-1.5 py-1">
                                                                    <button
                                                                        onClick={() => updateItemQuantity(item.id, Math.max(1, selectedQty - 1))}
                                                                        className="w-5 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-xs"
                                                                    >-</button>
                                                                    <span className="text-sm font-black w-4 text-center text-slate-900 dark:text-white">{selectedQty}</span>
                                                                    <button
                                                                        onClick={() => updateItemQuantity(item.id, Math.min(item.quantity, selectedQty + 1))}
                                                                        className="w-5 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-xs"
                                                                    >+</button>
                                                                    <span className="text-[10px] text-slate-400 ml-0.5">/ {item.quantity}</span>
                                                                </div>
                                                            )}
                                                            {(!isSelected || item.quantity === 1) && (
                                                                <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded ml-2">
                                                                    x{item.quantity}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-slate-900 dark:text-white text-sm ml-4 min-w-[60px] text-right">
                                                    ${(Number(item.unitPrice) * (isSelected ? selectedQty : item.quantity)).toLocaleString()}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-bold text-slate-500">
                                        Subtotal: ${currentSubtotal.toLocaleString()}
                                    </p>
                                    {isPhysical && (
                                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl">
                                            <span className="text-[10px] uppercase font-black text-slate-500 leading-tight w-min">{t('cashier.amount_received')}</span>
                                            <div className="relative">
                                                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                                                <input
                                                    type="number"
                                                    value={manualAmountReceived}
                                                    onChange={(e) => setManualAmountReceived(e.target.value)}
                                                    placeholder="0"
                                                    className="w-20 pl-4 pr-1 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-900 dark:text-white"
                                                />
                                            </div>
                                            {manualAmountReceived && Number(manualAmountReceived) > totalToCharge && (
                                                <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
                                                    <span className="text-[10px] uppercase font-black text-orange-600">{t('cashier.change')}</span>
                                                    <span className="text-sm font-black text-orange-600">${(Number(manualAmountReceived) - totalToCharge).toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tip Selection */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t('cashier.tip') || 'Propina (para este pago)'}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => setTipMode('none')}
                                className={`py-2 rounded-lg text-sm font-bold border transition-colors ${tipMode === 'none'
                                    ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                {t('cashier.no_tip') || 'Sin Propina'}
                            </button>
                            <button
                                onClick={() => setTipMode('percent')}
                                className={`py-2 rounded-lg text-sm font-bold border transition-colors ${tipMode === 'percent'
                                    ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                {defaultTipPercentage}% (${(currentSubtotal * (defaultTipPercentage / 100)).toLocaleString()})
                            </button>
                            <button
                                onClick={() => setTipMode('custom')}
                                className={`py-2 rounded-lg text-sm font-bold border transition-colors ${tipMode === 'custom'
                                    ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                {t('cashier.custom_tip') || 'Otro'}
                            </button>
                        </div>
                        {tipMode === 'custom' && (
                            <input
                                type="number"
                                value={customTipAmount}
                                onChange={(e) => setCustomTipAmount(e.target.value)}
                                placeholder="Monto de propina"
                                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900 dark:text-white font-medium placeholder-slate-400"
                            />
                        )}
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t('cashier.payment_method') || 'Método de Pago'}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {paymentMethods.length > 0 ? paymentMethods.map((m) => (
                                <button
                                    key={m.name}
                                    onClick={() => setPaymentMethod(m.name)}
                                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === m.name
                                        ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/20 text-orange-600'
                                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 text-slate-500'
                                        }`}
                                >
                                    {m.isDigital ? <Smartphone size={24} /> :
                                        m.name === 'efectivo' || m.name === 'cash' ? <Banknote size={24} /> :
                                            <CreditCard size={24} />}
                                    <span className="text-xs font-bold truncate w-full text-center">{m.label || m.name}</span>
                                </button>
                            )) : (
                                <div className="col-span-3 text-center text-sm text-slate-500 py-2">
                                    No hay métodos de pago configurados
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-4">
                    <div className="flex justify-between items-center text-lg font-bold text-slate-900 dark:text-white">
                        <span>Total a Cobrar</span>
                        <span>${totalToCharge.toLocaleString()}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={handlePrint}
                            className="py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <Printer size={20} />
                            {t('cashier.print_pre_bill') || 'Imprimir'}
                        </button>
                        <button
                            onClick={handlePay}
                            disabled={isSubmitting || totalToCharge <= 0}
                            className="py-4 bg-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                            ) : (
                                <DollarSign size={20} />
                            )}
                            {order.status === 'listo_pagar'
                                ? (t('cashier.pay_and_close') || 'Pagar y Cerrar')
                                : (t('cashier.register_payment') || 'Registrar Pago')
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
