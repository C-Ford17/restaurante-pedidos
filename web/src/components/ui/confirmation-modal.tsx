'use client'

import { AlertTriangle, Loader2 } from 'lucide-react'
import { useLanguage } from '../providers/language-provider'

interface ConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title?: string
    message?: string
    confirmText?: string
    cancelText?: string
    isDestructive?: boolean
    loading?: boolean
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    isDestructive = true,
    loading = false
}: ConfirmationModalProps) {
    const { t } = useLanguage()

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200`}>
                <div className="p-6 text-center space-y-4">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${isDestructive ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                        }`}>
                        <AlertTriangle size={24} />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {title || t('modal.confirm')}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {message || 'Are you sure you want to proceed? This action cannot be undone.'}
                        </p>
                    </div>

                    <div className="flex gap-3 justify-center pt-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                            {cancelText || t('modal.cancel')}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 ${isDestructive
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {confirmText || t('modal.delete')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
