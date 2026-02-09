'use client'

import React from 'react'
import { ShoppingCart, X, Trash2, Minus, Plus, Scissors, MessageSquarePlus, Printer, RefreshCw } from 'lucide-react'

interface CartItem {
    cartItemId: string
    id: string
    name: string
    price: number
    quantity: number
    notes: string
}

interface CartOverlayProps {
    cart: CartItem[]
    isCartOpen: boolean
    setIsCartOpen: (open: boolean) => void
    t: (key: string, params?: any) => string
    removeFromCart: (cartItemId: string) => void
    updateQuantity: (cartItemId: string, delta: number) => void
    splitItem: (cartItemId: string) => void
    updateItemNotes: (cartItemId: string, notes: string) => void
    orderNote: string
    setOrderNote: (note: string) => void
    cartTotal: number
    submitOrder: () => void
    isSubmitting: boolean
    selectedTable: any
}

export const CartOverlay: React.FC<CartOverlayProps> = ({
    cart,
    isCartOpen,
    setIsCartOpen,
    t,
    removeFromCart,
    updateQuantity,
    splitItem,
    updateItemNotes,
    orderNote,
    setOrderNote,
    cartTotal,
    submitOrder,
    isSubmitting,
    selectedTable
}) => {
    return (
        <>
            {/* CART FLOATING BUTTON */}
            {cart.length > 0 && !isCartOpen && selectedTable && (
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="fixed bottom-6 right-6 bg-orange-600 text-white rounded-full p-4 shadow-xl shadow-orange-600/30 hover:scale-105 transition-transform z-40 flex items-center gap-2"
                >
                    <ShoppingCart size={24} />
                    <span className="bg-white text-orange-600 px-2 py-0.5 rounded-full text-xs font-bold">
                        {cart.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                </button>
            )}

            {/* CART MODAL OVERLAY */}
            {isCartOpen && (
                <div
                    className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setIsCartOpen(false)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 w-full sm:max-w-md sm:mx-auto sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* Cart Header */}
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <ShoppingCart className="text-orange-600" size={20} />
                                {t('waiter.order_summary')}
                            </h3>
                            <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="p-4 overflow-y-auto flex-1 space-y-4">
                            {cart.map((item) => (
                                <div key={item.cartItemId} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                                                {item.name}
                                            </h4>
                                            <span className="text-orange-600 dark:text-orange-400 text-sm font-bold">
                                                ${(item.price * item.quantity).toLocaleString()}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.cartItemId)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {/* Item Controls */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 h-8">
                                            <button
                                                onClick={() => updateQuantity(item.cartItemId, -1)}
                                                className="w-8 h-full flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center font-medium text-sm text-slate-900 dark:text-white">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.cartItemId, 1)}
                                                className="w-8 h-full flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        {item.quantity > 1 && (
                                            <button
                                                onClick={() => splitItem(item.cartItemId)}
                                                className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/30"
                                                title="Split Item"
                                            >
                                                <Scissors size={14} />
                                                {t('waiter.split')}
                                            </button>
                                        )}
                                    </div>

                                    {/* Item Notes */}
                                    <div className="mt-3 relative">
                                        <MessageSquarePlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                        <input
                                            type="text"
                                            placeholder={t('waiter.add_note_placeholder')}
                                            value={item.notes}
                                            onChange={(e) => updateItemNotes(item.cartItemId, e.target.value)}
                                            className="w-full pl-9 pr-3 py-1.5 text-sm bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary & Submit */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t('waiter.general_note')}</label>
                                <textarea
                                    value={orderNote}
                                    onChange={(e) => setOrderNote(e.target.value)}
                                    placeholder={t('waiter.general_note_placeholder')}
                                    className="w-full p-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 resize-none h-16 focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500"
                                />
                            </div>

                            <div className="flex justify-between items-center py-2">
                                <span className="text-slate-600 dark:text-slate-400">{t('waiter.total')}</span>
                                <span className="text-xl font-black text-slate-900 dark:text-white">
                                    ${cartTotal.toLocaleString()}
                                </span>
                            </div>

                            <button
                                onClick={submitOrder}
                                disabled={isSubmitting || cart.length === 0}
                                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <RefreshCw className="animate-spin" /> : <Printer size={20} />}
                                {isSubmitting ? t('waiter.submitting') : t('waiter.send_order')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
