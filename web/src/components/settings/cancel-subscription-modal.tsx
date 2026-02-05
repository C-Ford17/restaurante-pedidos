'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface CancelSubscriptionModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    loading: boolean
    nextBillingDate?: Date | null
}

export function CancelSubscriptionModal({
    isOpen,
    onClose,
    onConfirm,
    loading,
    nextBillingDate
}: CancelSubscriptionModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                                <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                ¿Cancelar suscripción?
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                Tu suscripción se cancelará al final del período de facturación actual
                                {nextBillingDate && (
                                    <> ({new Date(nextBillingDate).toLocaleDateString()})</>
                                )}. Después de esa fecha, tu plan volverá al plan básico gratuito.
                            </p>
                            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mb-4">
                                <p className="text-sm text-orange-800 dark:text-orange-200">
                                    <strong>Nota:</strong> Seguirás teniendo acceso a todas las funciones hasta el final del período de facturación.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        Mantener suscripción
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {loading ? 'Cancelando...' : 'Sí, cancelar'}
                    </button>
                </div>
            </div>
        </div>
    )
}
