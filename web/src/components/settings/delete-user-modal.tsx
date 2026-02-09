'use client'

import { useState } from 'react'
import { X, Loader2, AlertTriangle } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'

interface DeleteUserModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    user: {
        id: string
        name: string
        username: string
    } | null
}

export function DeleteUserModal({ isOpen, onClose, onSuccess, user }: DeleteUserModalProps) {
    const { t } = useLanguage()
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!user) return

        setLoading(true)
        try {
            const response = await fetch(`/api/users/${user.id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                onSuccess()
                onClose()
            } else {
                const error = await response.json()
                alert(error.error || 'Error al eliminar usuario')
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Error al eliminar usuario')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen || !user) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {t('modal.delete.userTitle')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
                        </div>
                        <div>
                            <p className="text-slate-700 dark:text-slate-300 mb-2">
                                {t('modal.delete.userText')} <strong>{user.name}</strong> ({user.username})?
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t('modal.delete.warning')}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            {t('modal.cancel')}
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {loading ? t('modal.processing') : t('modal.delete')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
