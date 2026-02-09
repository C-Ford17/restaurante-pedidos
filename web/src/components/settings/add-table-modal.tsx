'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'

interface AddTableModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function AddTableModal({ isOpen, onClose, onSuccess }: AddTableModalProps) {
    const [loading, setLoading] = useState(false)
    const { t } = useLanguage()
    const [formData, setFormData] = useState({
        numero: '',
        capacidad: '4',
        isBlockable: true
    })

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('/api/tables', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    number: parseInt(formData.numero),
                    capacity: parseInt(formData.capacidad),
                    isBlockable: formData.isBlockable
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Error al crear mesa')
            }

            onSuccess()
            onClose()
            setFormData({ numero: '', capacidad: '4', isBlockable: true })
        } catch (error) {
            console.error('Error creating table:', error)
            alert(error instanceof Error ? error.message : 'Error al crear mesa')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {t('tablemodal.title')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('tablemodal.number')}
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={formData.numero}
                            onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
                            placeholder="1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('tablemodal.capacity')}
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            max="20"
                            value={formData.capacidad}
                            onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
                            placeholder="4"
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <input
                            type="checkbox"
                            id="isBlockable-add"
                            checked={formData.isBlockable}
                            onChange={(e) => setFormData({ ...formData, isBlockable: e.target.checked })}
                            className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-orange-600 focus:ring-orange-500 bg-white dark:bg-slate-700 cursor-pointer"
                        />
                        <label htmlFor="isBlockable-add" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                            {t('tablemodal.is_blockable') || 'Waiters can block (QR)'}
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            {t('modal.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {loading ? t('modal.processing') : t('tablemodal.create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
