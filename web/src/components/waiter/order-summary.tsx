'use client'

import { useOrderStore } from '@/stores/order-store'
import { Plus, Minus, Trash2, Send, Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function OrderSummary() {
    const currentOrder = useOrderStore((state) => state.currentOrder)
    const selectedTable = useOrderStore((state) => state.selectedTable)
    const removeItem = useOrderStore((state) => state.removeItem)
    const updateItemQuantity = useOrderStore((state) => state.updateItemQuantity)
    const clearOrder = useOrderStore((state) => state.clearOrder)

    const [isSending, setIsSending] = useState(false)

    const total = currentOrder.reduce((acc, item) => acc + (item.precio * item.cantidad), 0)

    const handleSendOrder = async () => {
        setIsSending(true)
        // Validate
        if (!selectedTable) return

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        alert(`Pedido enviado a cocina para Mesa ${selectedTable}!`)
        clearOrder()
        setIsSending(false)
    }

    if (!selectedTable) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold opacity-50">?</span>
                </div>
                <p>Selecciona una mesa para comenzar</p>
            </div>
        )
    }

    if (currentOrder.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <p>Agrega productos del menú</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {currentOrder.map((item) => (
                    <div key={item.uniqueId} className="flex gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex flex-col items-center gap-1">
                            <button
                                onClick={() => updateItemQuantity(item.uniqueId, 1)}
                                className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                            >
                                <Plus size={12} />
                            </button>
                            <span className="text-sm font-bold w-6 text-center">{item.cantidad}</span>
                            <button
                                onClick={() => {
                                    if (item.cantidad > 1) updateItemQuantity(item.uniqueId, -1)
                                    else removeItem(item.uniqueId)
                                }}
                                className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                            >
                                <Minus size={12} />
                            </button>
                        </div>

                        <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-slate-800 leading-snug">{item.nombre}</span>
                                <button
                                    onClick={() => removeItem(item.uniqueId)}
                                    className="text-slate-400 hover:text-red-500 transition-colors p-0.5"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">${item.precio.toLocaleString()} c/u</span>
                                <span className="font-bold text-slate-700">${(item.precio * item.cantidad).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-500 font-medium">Total</span>
                    <span className="text-2xl font-black text-slate-800">${total.toLocaleString()}</span>
                </div>

                <button
                    onClick={handleSendOrder}
                    disabled={isSending}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:translate-y-[1px]"
                >
                    {isSending ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <>
                            Enviar a Cocina <Send size={18} />
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
